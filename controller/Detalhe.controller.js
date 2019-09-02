sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, JSONModel, History, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("camLog.ZMM_CAM_LOG.controller.Detalhe", {

		onInit: function () {
			// Get the Router Info
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// Validate/Match the Router Details sent from source using oRouter.navTo("RouteDetalhe", {SelectedItem: selectPO});
			oRouter.getRoute("RouteDetalhe").attachMatched(this._onRouteFound, this);

			//Cria pop-up de confirmação para status pago
			this.oDialogConfirm = "";

			var oPopUpConfirm,
				oPopUpCancel,
				oVBox1,
				oVBox2;

			var that = this;

			//Sempre valida se o objeto já existe com o mesmo ID, caso nao exista, cria o mesmo
			if (typeof (sap.ui.getCore().byId("btnPopUpSave")) === "undefined")
				oPopUpConfirm = new sap.m.Button("btnPopUpSave", {
					text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("btnConfirmar"),
					enabled: false,
					press: function (oData) {
						that.onPopUpConfirm(oData);
					}
				});
			else
				oPopUpConfirm = sap.ui.getCore().byId("btnPopUpSave");

			//Sempre valida se o objeto já existe com o mesmo ID, caso nao exista, cria o mesmo
			if (typeof (sap.ui.getCore().byId("btnPopUpCancel")) === "undefined")
				oPopUpCancel = new sap.m.Button("btnPopUpCancel", {
					text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("btnCancelar"),
					press: function () {
						that.oDialogConfirm.close();
					}
				});
			else
				oPopUpCancel = sap.ui.getCore().byId("btnPopUpCancel");

			//Sempre valida se o objeto já existe com o mesmo ID, caso nao exista, cria o mesmo
			if (typeof (sap.ui.getCore().byId("vbox1")) === "undefined")
				oVBox1 = new sap.m.VBox("vbox1", {
					items: [
						new sap.m.Label({
							text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblPopNsu"),
							required: true
						}),
						new sap.m.Input({
							maxLength: 4,
							id: "popUpCup",
							width: "20%",
							liveChange: this.onPopUpMatChange
						}).addStyleClass("sapUiMediumMarginBegin")
					]
				});
			else
				oVBox1 = sap.ui.getCore().byId("vbox1");

			//Sempre valida se o objeto já existe com o mesmo ID, caso nao exista, cria o mesmo
			if (typeof (sap.ui.getCore().byId("vbox2")) === "undefined")
				oVBox2 = new sap.m.VBox("vbox2", {
					items: [
						new sap.m.Label({
							text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblPopMat"),
							required: true
						}),
						new sap.m.Input({
							maxLength: 10,
							id: "popUpMat",
							width: "38%",
							liveChange: this.onPopUpMatChange
						}).addStyleClass("sapUiMediumMarginBegin")
					]
				});
			else
				oVBox2 = sap.ui.getCore().byId("vbox2");

			//Sempre valida se o objeto já existe com o mesmo ID, caso nao exista, cria o mesmo
			if (typeof (sap.ui.getCore().byId("Autoriza")) === "undefined")
				this.oDialogConfirm = new sap.m.Dialog("Autoriza", {
					title: "Confirma pagamento",
					contentWidth: "1em",
					buttons: [oPopUpConfirm, oPopUpCancel],
					content: [
						oVBox2.addStyleClass("sapUiSmallMargin"),
						oVBox1.addStyleClass("sapUiSmallMargin")
					]
				});
			else
				this.oDialogConfirm = sap.ui.getCore().byId("Autoriza");
		},

		/**
		 * Ao encontrar a pagina executa esse method para preenchimento da tela de itens
		 */
		_onRouteFound: function (oEvt) {
			var NPerson = oEvt.getParameter("arguments").NPerson;
			var oModelTable = sap.ui.getCore().getModel("default").workListViewTable.getModel();
			var pedido = oModelTable.getData().pedidos.find(this.dadosPedido(NPerson));
			this.ItemNPerson = NPerson;
			this.exibeDadosPedido(pedido);
		},

		/**
		 * Retorna numero do pedido selecionado
		 */
		dadosPedido: function (NPerson) {
			return function (element) {
				return element.NPerson === NPerson;
			};
		},

		/**
		 * Carrega campos da tela com os dados dos pedidos seleiconados
		 */
		exibeDadosPedido: function (pPedido) {
			var vCheckPos = 1;
			var i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var ttlDetalhe = i18n.getText("ttlDetalhe");

			if (pPedido.StatusPag === i18n.getText("stsNpago")) {
				this.getView().byId("btnPago").setVisible(true);
				this.getView().byId("btnSend").setVisible(true);
				sap.ui.getCore().byId("btnPopUpSave").setVisible(true);
				sap.ui.getCore().byId("popUpCup").setEnabled(true);
				sap.ui.getCore().byId("popUpMat").setEnabled(true);
			} else {
				this.getView().byId("btnPago").setVisible(false);
				this.getView().byId("btnSend").setVisible(false);
			}

			if (pPedido.StatusPag === i18n.getText("stsPagoM")) {
				this.getView().byId("btnExibe").setVisible(true);
				sap.ui.getCore().byId("btnPopUpSave").setVisible(false);
				sap.ui.getCore().byId("popUpCup").setEnabled(false);
				sap.ui.getCore().byId("popUpMat").setEnabled(false);
			} else {
				this.getView().byId("btnExibe").setVisible(false);
			}

			if (pPedido.StatusProc === i18n.getText("stsApers"))
				this.getView().byId("btnConclu").setVisible(true);
			else
				this.getView().byId("btnConclu").setVisible(false);

			this.getView().byId("idDetalhePage").setTitle(ttlDetalhe + " " + pPedido.NPerson);

			this.getView().byId("colab").setValue(pPedido.Vendedor);
			this.getView().byId("nome").setValue(pPedido.NmCliente);

			if (pPedido.Stcd2 !== "")
				this.getView().byId("cpf").setValue(this.applyCPFmask(pPedido.Stcd2));
			else
				this.getView().byId("cpf").setValue(this.applyCNPJmask(pPedido.Stcd1));

			this.getView().byId("produto").setValue(pPedido.Matnr);
			this.getView().byId("nmPerso").setValue(pPedido.NmPers);

			this.getView().byId("email").setValue(pPedido.Smtpadr);

			this.getView().byId("rbNmAli").setSelectedIndex(pPedido.NmAli - 1);
			this.getView().byId("rbNmPos").setSelectedIndex(pPedido.NmPos - 1);

			vCheckPos = pPedido.NmFonte.substring(1, 2);
			vCheckPos = vCheckPos - 1;
			this.getView().byId("rbNmFt").setSelectedIndex(vCheckPos);
			vCheckPos = 1;

			vCheckPos = pPedido.NmTpMat.substring(1, 2);
			vCheckPos = vCheckPos - 1;
			this.getView().byId("rbNmMat").setSelectedIndex(vCheckPos);
			vCheckPos = 1;

			this.getView().byId("numPerso").setValue(pPedido.NumPers);

			vCheckPos = pPedido.NumTpMat.substring(1, 2);
			vCheckPos = vCheckPos - 1;
			this.getView().byId("rbNumMat").setSelectedIndex(vCheckPos);
			vCheckPos = 1;

			vCheckPos = pPedido.NumFonte.substring(1, 2);
			vCheckPos = vCheckPos - 1;
			this.getView().byId("rbNumFt").setSelectedIndex(vCheckPos);
			vCheckPos = 1;

			if (pPedido.PersoOnly === "")
				this.getView().byId("cbPerso").setSelected(false);
			else
				this.getView().byId("cbPerso").setSelected(true);

			if (pPedido.NmCor !== ""	   ||
				(pPedido.NmAno !== "" &&
			     pPedido.NmAno !== "0000")    ) {
				this.getView().byId("NM_OPT").setVisible(true);
				if (pPedido.NmCor !== "") {
					this.getView().byId("nmCorText").setValue(pPedido.NmCor);
					this.getView().byId("NM_COR").setVisible(true);
				} else
					this.getView().byId("NM_COR").setVisible(false);
				if (pPedido.NmAno !== ""     &&
				    pPedido.NmAno !== "0000"   ) {
					this.getView().byId("nmAnoText").setValue(pPedido.NmAno);
					this.getView().byId("NM_ANO").setVisible(true);
				} else
					this.getView().byId("NM_ANO").setVisible(false);
			}else
				this.getView().byId("NM_OPT").setVisible(false);

			if (pPedido.NumCor !== ""	   ||
				(pPedido.NumAno !== "" &&
			     pPedido.NumAno !== "0000")    ) {
				this.getView().byId("NUM_OPT").setVisible(true);
				if (pPedido.NumCor !== "") {
					this.getView().byId("numCorText").setValue(pPedido.NumCor);
					this.getView().byId("NUM_COR").setVisible(true);
				} else
					this.getView().byId("NUM_COR").setVisible(false);
				if (pPedido.NumAno !== ""     &&
				    pPedido.NumAno !== "0000"   ) {
					this.getView().byId("numAnoText").setValue(pPedido.NumAno);
					this.getView().byId("NUM_ANO").setVisible(true);
				} else
					this.getView().byId("NUM_ANO").setVisible(false);
			}else
				this.getView().byId("NUM_OPT").setVisible(false);
		},

		/**
		 * Ação de reenvio do pedido
		 */
		onSend: function () {

			var oModel = this.getView().getModel();
			var oEntry = {
				Nperson: this.ItemNPerson,
				Werks: sap.ui.getCore().getModel("default").ttlText.getText().substring(0, 4)
			};
			this.getView().getModel().oGlobalBusyDialog.open();
			var that = this;

			//Executa o CREATE
			oModel.create("/ReEnviaPedidoSet", oEntry, {
				success: function (oSucess) {
					that.onSucessReSendCall(oSucess, oEntry.Nperson);
				},
				error: function (oError) {
					that.onErrorGenericReturn(oError);
				}
			});
		},

		/**
		 * Ação de finalização da personalização
		 */
		onStsEnd: function () {
			var oModel = this.getView().getModel();
			var pUpdate = "";
			var oEntry = {
				Nperson: this.ItemNPerson,
				Werks: sap.ui.getCore().getModel("default").ttlText.getText().substring(0, 4)
			};

			//Clausula para o UPDATE
			pUpdate = "/EndStsProcSet(Werks='" + oEntry.Werks + "',Nperson='" + oEntry.Nperson + "')";

			var that = this;
			//Executa o UPDATE
			oModel.update(pUpdate, oEntry, {
				success: function (oSucess) {
					that.onSucessEndStsCall(oSucess, oEntry.NPerson);
				},
				error: function (oError) {
					that.onErrorGenericReturn(oError);
				}
			});
		},

		/**
		 * Ação em caso de sucesso no UPDATE para finalização da personalização
		 */
		onSucessEndStsCall: function (oSucess, NPerson) {
			this.getView().getModel().onBackEnd = true;
			this.onBack();
			return;
		},

		/**
		 * Ação do botão de "confirmar" no popUp de pago manualmente
		 */
		onPopUpConfirm: function (oData) {
			var pUpdate = "";
			var oEntry = {
				Werks: sap.ui.getCore().getModel("default").ttlText.getText().substring(0, 4),
				NPerson: this.ItemNPerson,
				Vendedor: sap.ui.getCore().byId("popUpMat").getValue(),
				Cupom: sap.ui.getCore().byId("popUpCup").getValue()
			};
			var oModel = this.getOwnerComponent().getModel();

			//Clausula para o UPDATE
			pUpdate = "/ChgStsPagSet(Werks='" + oEntry.Werks +
				"',NPerson='" + oEntry.NPerson + "')";

			this.getView().getModel().oGlobalBusyDialog.open();
			var that = this;

			//Executa o UPDATE
			oModel.update(pUpdate, oEntry, {
				success: function (oSucess) {
					that.onSucessChgStsCall(oSucess, oEntry.NPerson);
				},
				error: function (oError) {
					that.onErrorGenericReturn(oError);
				}
			});
		},

		/**
		 * Ação em caso de sucesso no UPDATE para status pago da personalização
		 */
		onSucessChgStsCall: function (oSucess, NPerson) {
			this.oDialogConfirm.close();
			sap.ui.getCore().byId("popUpCup").setValue("");
			sap.ui.getCore().byId("popUpMat").setValue("");
			this.getView().getModel().onBackPag = true;
			this.onBack();
			return;
		},

		/**
		 * Ação em caso de sucesso no CREATE para reenvio do pedido de personalização
		 */
		onSucessReSendCall: function (oSucess, pNPerson) {
			var msg = "";
			this.getView().getModel().oGlobalBusyDialog.close();
			msg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("me09") + " " +
				pNPerson + " " +
				this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("me10");
			MessageToast.show(msg);
			return;
		},

		/**
		 * Trata retorno de erros genéricos vindos do SAP
		 */
		onErrorGenericReturn: function (oError) {
			var errorRes = JSON.parse(oError.responseText);
			var i = 0;
			var oMessage = {};

			try {
				// Le mensages de erro
				do {
					var erroDetail = errorRes.error.innererror.errordetails[i];
					if (erroDetail.code === "") {
						oMessage[i] = ({
							type: "Error",
							title: erroDetail.message,
							description: ""
						});
					}
					i++;

				} while (errorRes.error.innererror.errordetails[i]);

				if (typeof oMessage[0] !== "undefined")
					sap.m.MessageBox.error(oMessage[0].title);
				else
					sap.m.MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("me06"));
				this.getView().getModel().oGlobalBusyDialog.close();
			} catch (e) {
				sap.m.MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("me06"));
				this.getView().getModel().oGlobalBusyDialog.close();
			}
		},

		/**
		 * Abre popUp para entrada de pagamento manual
		 */
		onStsPago: function () {
			sap.ui.getCore().byId("popUpCup").setValue("");
			sap.ui.getCore().byId("popUpMat").setValue("");
			sap.ui.getCore().byId("btnPopUpSave").setEnabled(false);
			this.oDialogConfirm.open();
		},

		/**
		 * Abre popUp para exibição de dados de pagamento manual
		 */
		onStsExibe: function () {
			var oModel = this.getView().getModel();
			var oEntry = {
				Nperson: this.ItemNPerson,
				Werks: this.getView().getModel().ttlText.getText().substring(0, 4)
			};
			var that = this;
			//Preenche clausula para o READ
			var vRead = "/SelecApvProcSet(Werks='" + oEntry.Werks + "',Nperson='" + oEntry.Nperson + "')";

			this.getView().getModel().oGlobalBusyDialog.open();

			//Executa READ
			oModel.read(vRead, {
				success: function (oSucess) {
					that.onSucessSelecApv(oSucess);
				},
				error: function (oError) {
					that.onErrorGenericReturn(oError);
				}
			});
		},

		/**
		 * Ação para aprovador selecionado com sucesso
		 */
		onSucessSelecApv: function (oSucess) {
			sap.ui.getCore().byId("popUpCup").setValue(oSucess.Cupom);
			sap.ui.getCore().byId("popUpMat").setValue(oSucess.Matricula);
			this.getView().getModel().oGlobalBusyDialog.close();
			this.oDialogConfirm.open();
		},

		/**
		 * Validação real time dos dados informados no campo de matricula no popup para entrada de pagamento manual
		 */
		onPopUpMatChange: function (oEvent) {
			if (isNaN(oEvent.getSource().getValue()))
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			else
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);

			if (sap.ui.getCore().byId("popUpCup").getValueState() === sap.ui.core.ValueState.None &&
				sap.ui.getCore().byId("popUpCup").getValue() !== "" &&
				sap.ui.getCore().byId("popUpMat").getValueState() === sap.ui.core.ValueState.None &&
				sap.ui.getCore().byId("popUpMat").getValue() !== "")

				sap.ui.getCore().byId("btnPopUpSave").setEnabled(true);
			else
				sap.ui.getCore().byId("btnPopUpSave").setEnabled(false);
		},

		/*
		  Função que aplica a mascara de CPF caso o mesmo seja informado corretamente
		 */
		applyCPFmask: function (vCPF) {
			//Coloca ponto entre o segundo e o terceiro dígitos
			return vCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
		},

		/*
		 Função que aplica a mascara de CNPJ caso o mesmo seja informado corretamente
		 */
		applyCNPJmask: function (vCNPJ) {
			//Coloca ponto entre o segundo e o terceiro dígitos
			return vCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
		},

		/*
		 Ação de botão de retrono para tela principal
		 */
		onBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteWorklist", true);
			}
		}

	});

});