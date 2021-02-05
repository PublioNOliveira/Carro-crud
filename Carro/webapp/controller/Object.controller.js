sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter"
], function (BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("ns.Carro.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
					// Restore original busy indicator delay for the object view
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				}
			);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress : function () {
			var oViewModel = this.getModel("objectView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},


		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */

        onObjectCriar: function (oEvent){
            var oCreate = {};
            var oInputModelo = this.getView().byId("inputModelo");
            var oInputAno = this.getView().byId("inputAno");
            oCreate.modelo = oInputModelo.getValue();
            oCreate.ano = oInputAno.getValue();
            
            var sUrl = "/Carro";
            var oRouter = this.getRouter();
           
            this.getModel().create(sUrl, oCreate, {
                success: function (oData){
                    var sMsg = " O id " + oData.id + " foi criado com sucesso ";
                    sap.m.MessageToast.show(sMsg);
                    oRouter.navTo("worklist");
                },
                error: function (oData){
                    sap.m.MessageToast.show("Erro ao criar");
                    oRouter.navTo("worklist");
                }
            });
        },
        
        onObjectEditar: function (oEvent){
            this.getView().byId("inputId").setEditable(false);
            this.getView().byId("inputModelo").setEditable(true);
            this.getView().byId("inputAno").setEditable(true);
            
            this.getView().byId("btnCriar").setEditable(false);
            this.getView().byId("btnSalvar").setEditable(true);
            this.getView().byId("btnEditar").setEditable(true);
            this.getView().byId("btnExcluir").setEditable(false);
        },

        onObjectSalvar: function (oEvent){
            var oUpdate = {};
            var oInputId = this.getView().byId("inputId");
            var oInputModelo = this.getView().byId("inputModelo");
            var oInputAno = this.getView().byId("inputAno");

            var sId = oInputId.getValue();

            oUpdate.modelo = oInputModelo.getValue();
            oUpdate.ano = oInputAno.getValue();

            var sUrl = "/Carro(" + sId + ")";
            var oRouter = this.getRouter();

            this.getModel().update(sUrl, oUpdate, {
                success: function (oData){
                    var sMsg = "O id foi atualizado com sucesso";
                    sap.m.MessageToast.show(sMsg);
                    oRouter.navTo("worklist");
                },
                error: function (oData){
                var sMsg = "Erro ao atualizar"
                    sap.m.MessageToast.show(sMsg);
                    oRouter.navTo("worklist");
                }
            });
        },

        onObjectExcluir: function (oEvent){
            var oInputId = this.getView().byId("inputId");
            var sId = oInputId.getValue();
            var sUrl = "/Carro(" + sId + ")";
            var oRouter = this.getRouter();

            this.getModel().remove(sUrl, {
                success: function (oData){
                    var sMsg = "Registro excluído"
                    sap.m.MessageToast.show(sMsg);
                    oRouter.navTo("worklist");
                },
                error: function (oData){
                var sMsg = "Erro ao excluir"
                    sap.m.MessageToast.show(sMsg);
                    oRouter.navTo("worklist");
                }
            });
        },


		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
            
            if (sObjectId = "novo"){
            //Fecha os campos para edição
            this.getView().byId("inputId").setEditable(false);
            this.getView().byId("inputModelo").setEditable(true);
            this.getView().byId("inputAno").setEditable(true);
            
            //Limpa os valores dos campos
            this.getView().byId("inputId").setValue("");
            this.getView().byId("inputModelo").setValue("");
            this.getView().byId("inputAno").setValue("");

            //Disponibilida os botões
            this.getView().byId("btnCriar").setVisible(true);
            this.getView().byId("btnSalvar").setVisible(false);
            this.getView().byId("btnEditar").setVisible(false);
            this.getView().byId("btnExcluir").setVisible(false);
                
            //Destrava a tela
            var oViewModel = this.getModel("objectView");
            oViewModel.setProperty("/busy", false);

            } else {
            //Fecha os campos para edição
            this.getView().byId("inputId").setEditable(false);
            this.getView().byId("inputModelo").setEditable(false);
            this.getView().byId("inputAno").setEditable(false);
            
            //Disponibilida os botões
            this.getView().byId("btnCriar").setVisible(false);
            this.getView().byId("btnSalvar").setVisible(false);
            this.getView().byId("btnEditar").setVisible(true);
            this.getView().byId("btnExcluir").setVisible(true);
            
            this.getModel().read("/Carro(" + sObjectId + ")",{
                success: function (oData){
                    this.getView().byId("inputId").setValue(oData.id);
                    this.getView().byId("inputModelo").setValue(oData.modelo);
                    this.getView().byId("inputAno").setValue(oData.ano);
                }
            });        
            }         
            
            this.getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getModel().createKey("Carro", {
					id :  sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
 
        /**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.id,
				sObjectName = oObject.id;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#Carro-display&/Carro/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});