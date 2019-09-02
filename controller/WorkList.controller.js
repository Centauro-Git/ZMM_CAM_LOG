sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, JSONModel, History, Filter, FilterOperator, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("camLog.ZMM_CAM_LOG.controller.WorkList", {
		onInit: function () {

			var oModel = this.getOwnerComponent().getModel();
			var vUser;
			var pRead;
			var cUrlParameters = "$expand=PedidoSet";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			//Inicia busy indicator
			oGlobalBusyDialog.open();

			//Carrega textos i18n
			oModel.i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			//Carrega tabela com vazia para preenchimento
			oModel.workListViewTable = this.getView().byId("table");
			//Carrega o filtro por data
			oModel.datePicker = this.getView().byId("rangeDate");
			//Carrega o texto de header da tabela
			oModel.ttlText = this.getView().byId("ttlHeader");
			//Instancia o busy indicator ao modulo
			oModel.oGlobalBusyDialog = oGlobalBusyDialog;
			
			//Carrega campos para controle de navegação vinda do item
			oModel.onBackPag = false;
			oModel.onBackEnd = false;
			
			//Instancia o Modelo no core
			sap.ui.getCore().setModel(oModel, "default");
			
			//Tenta identificar o usuario logado(funciona apenas em alguns browsers)
			if (typeof sap.ushell !== "undefined")
				vUser = sap.ushell.Container.getService("UserInfo").getId();
			else
				vUser = "";

			//Monta chamada do odata para seleção dos items de log
			pRead = "/CamPersoSelecLogSet(Uname='" + vUser + "')";
			
			var oView = this.getView();
			var that = this;
			
			// Ação de retorno da tela de itens
			oView.addEventDelegate({
				onAfterShow: function (oEvent) {
					if(that.getView().getModel().onBackPag === true ||
					   that.getView().getModel().onBackEnd === true   ){
						var i18n = that.getOwnerComponent().getModel("i18n").getResourceBundle();
						that.onRefresh();
						if(that.getView().getModel().onBackPag === true){
							that.getView().getModel().onBackPag = false;
							MessageToast.show(i18n.getText("me07"));
						}else{
							that.getView().getModel().onBackEnd = false;
							MessageToast.show(i18n.getText("me07"));
						}
					}
				}
			}, oView);
			
			//Dispara GET
			oModel.read(pRead, {
				urlParameters: cUrlParameters,
				success: this.onSucessFirstLoad,
				error: this.onErrorFirstLoad
			});
		},

		/**
		 * Exibe detalhes do pedido selecionado
		 */
		onItemPress: function (oEvent) {
			
			//Carrega objeto de navegação
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Carrega lista de items
			var oItem = oEvent.getParameter("listItem");
			//Carrega linha selecionada
			var oLine = oItem.getBindingContext();
			//Carrega item selecionado
			var NPerson = oLine.getProperty("NPerson");

			//Navega para tela de itens
			oRouter.navTo("RouteDetalhe", {
				NPerson: NPerson
			});
		},

		/**
		 * Faz carga de itens na tela do worklist
		 */
		onSucessFirstLoad: function (oData) {
			var value = [];
			var dateIni = new Date();
			var dateFim = new Date();
			var oTable;
			var oDatePicker;
			var oModelTable = new sap.ui.model.json.JSONModel();
			//Cria template para exibição dos itens na tela
			var oTableTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{NPerson}",
						wrapping: false
					}),
					new sap.m.Text({
						text: "{NmCliente}",
						wrapping: false
					}),
					new sap.m.Text({
						text: "{NmPers}",
						wrapping: false
					}),
					new sap.m.Text({
						text: "{NumPers}",
						wrapping: false
					}),
					new sap.m.Text({
						text: {
								path: "StatusPag",
								//Colore os textos vermelhos
								formatter: function (text){
									this.removeStyleClass("cssred");
									if (text === sap.ui.getCore().getModel("default").i18n.getText("stsNpago"))
										this.addStyleClass("cssred");
									return text;
								}
						},
						wrapping: false
					}),
					new sap.m.Text({
						text: { 
								path: "StatusProc",
								//Colore os textos vermelhos
								formatter: function (text){
									this.removeStyleClass("cssred");
									if (text === sap.ui.getCore().getModel("default").i18n.getText("stsApers"))
										this.addStyleClass("cssred");
									return text;
								}
					},
						wrapping: false
					})
				]
			});

			//Inclui a descrição do centro no header do monitor
			if (oData.DescCentro !== "")
				sap.ui.getCore().getModel("default").ttlText.setText(oData.DescCentro);

			//Inclui o icone ">" em cada linha do monitor
			oTableTemplate.setType("Navigation");

			//Recupera valor da tabela de pedidos selecionada do deep Entity
			value = oData.PedidoSet.results;

			//Atribui tabela do DeepEntity ao Model da tabela
			oModelTable.setData({
				pedidos: value
			});

			//Recupera tabela vazia da tela
			oTable = sap.ui.getCore().getModel("default").workListViewTable;
			//Atribui modulo com os dados a tabela da tela
			oTable.setModel(oModelTable);
			//Atribui os itens do modulo as linhas da tabela usando o Tamplate como base
			oTable.bindItems("/pedidos", oTableTemplate);
			
			//Alimenta data inicial de exibição do monitor
			dateIni.setUTCDate(oData.DtIni.getUTCDate());
			dateIni.setUTCMonth(oData.DtIni.getUTCMonth());
			dateIni.setUTCFullYear(oData.DtIni.getUTCFullYear());

			//Alimenta data final de exibição do monitor
			dateFim.setUTCDate(oData.DtFim.getUTCDate());
			dateFim.setUTCMonth(oData.DtFim.getUTCMonth());
			dateFim.setUTCFullYear(oData.DtFim.getUTCFullYear());
			
			var today = new Date();
			
			var oModelDatePicker = new JSONModel();
			
			//Inicia modelo para o filtro de data
			oModelDatePicker.setData({
				dateFim: dateFim,
				dateValue: dateIni,
				secondDateValue: dateFim,
				dateMin: new Date(2019, 0, 1),//Minima data possivel para seleção
				dateMax: today//Maxima data possivel para seleção
			});

			//Instancia modelo ao filtro
			oDatePicker = sap.ui.getCore().getModel("default").datePicker;
			oDatePicker.setModel(oModelDatePicker);

			//Vinaliza busyindicators
			sap.ui.getCore().getModel("default").oGlobalBusyDialog.close();
			sap.ui.getCore().getModel("default").workListViewTable.setBusy(false);
		},

		/**
		 * Tratativa de erro em caso de nenhum retorno de dados para a seleção dos itens
		 */
		onErrorFirstLoad: function (oError) {
			sap.ui.getCore().getModel("default").oGlobalBusyDialog.close();
			sap.ui.getCore().getModel("default").workListViewTable.setBusy(false);
		},

		/**
		 * Ação de atualização dos itens da tela
		 */
		onRefresh: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var vUser;
			var pRead;
			var cUrlParameters = "$expand=RefreshHeaderSet/PedidoSet";
			//Inicia busy indicator da tabela
			oModel.workListViewTable.setBusy(true);
			
			if (typeof sap.ushell !== "undefined")
				vUser = sap.ushell.Container.getService("UserInfo").getId();
			else
				vUser = "";

			//Inicia campos informados na chamada do OData
			var aUrlFields = {
				uname: vUser,
				dtIni: "",
				dtFim: "",
				selAll: ""
			};

			//Tratativa para seleiconar os dados concluidos
			if (this.getView().byId("selAll").getSelected() === true)
				aUrlFields.selAll = "X";

			//Tratativa para adicionar HHMMSS na chamda do OData
			aUrlFields.dtIni = this.getView().byId("rangeDate").getDateValue().toISOString().substring(0, 10) + "T00%3A00%3A00";
			aUrlFields.dtFim = this.getView().byId("rangeDate").getSecondDateValue().toISOString().substring(0, 10) + "T00%3A00%3A00";

			//Clausula do comando GET Entity
			pRead = "/RefreshHeaderSet(Uname='" + aUrlFields.uname +
				"',DtIni=datetime'" + aUrlFields.dtIni +
				"',DtFim=datetime'" + aUrlFields.dtFim +
				"',SelectAll='" + aUrlFields.selAll + "')";

			var that = this;
			
			//Chamada do GET
			oModel.read(pRead, {
				urlParameters: cUrlParameters,
				success: function (oSucess) {
					that.onSucessFirstLoad(oSucess.RefreshHeaderSet);
				},
				error: this.onErrorFirstLoad
			});
		},

		/**
		 * Lógica para pesquisa dos dados na tabela de itens
		 */
		onSearch: function (oEvent) {
			var aFilter = [];
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var sQuery = oEvent.getParameter("query");

				//Adiciona os campos que poderam ser pesquisados pelo texto informado na "pesquisa"
				if (sQuery && sQuery.length > 0) {
					aFilter.push(new Filter("NPerson", FilterOperator.Contains, sQuery));
					aFilter.push(new Filter("NmCliente", FilterOperator.Contains, sQuery));
					aFilter.push(new Filter("StatusPag", FilterOperator.Contains, sQuery));
					aFilter.push(new Filter("StatusProc", FilterOperator.Contains, sQuery));
				}
				//Carrega tabela
				var oList = this.getView().byId("table");
				//Carrega itens
				var oBinding = oList.getBinding("items");
				//Instancia os filtros
				oBinding.filter(new Filter({
					filters: [
						new Filter("NPerson", FilterOperator.Contains, sQuery),
						new Filter("NmCliente", FilterOperator.Contains, sQuery),
						new Filter("StatusPag", FilterOperator.Contains, sQuery),
						new Filter("StatusProc", FilterOperator.Contains, sQuery)
					],
					and: false
				}));
			}
		}
	});
});