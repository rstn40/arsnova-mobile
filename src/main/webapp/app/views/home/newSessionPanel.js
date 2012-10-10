/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/newSessionPanel.js
 - Beschreibung: Panel zum Erzeugen einer neuen Session (Zuhörer).
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
ARSnova.views.home.NewSessionPanel = Ext.extend(Ext.Panel, {
	scroll		: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/* items */
	sessionIdField: null,
	
	unavailableSessionIds: [],
	
	constructor: function(responseText){
		if(responseText == null){
			var course = new Array();
		} else {
			var course = Ext.decode(responseText);
		}
		
		this.backButton = new Ext.Button({
			text	: Messages.SESSIONS,
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.mySessionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.NEW_SESSION,
			cls	 : 'titlePaddingLeft',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.sessionIdField = new Ext.form.Text({
            name		: 'keyword',
            label		: 'Session-ID',
            disabled	: true,
        });
		
		this.items = [{
			title: 'createSession',
			xtype: 'form',
			id: 'createSession',
			submitOnAction: false,
			items: [{
	            xtype: 'fieldset',
	            instructions: Messages.SESSIONID_WILL_BE_CREATED,
	            items: [{
	                xtype		: 'textfield',
	                name		: 'name',
	                label		: Messages.SESSION_NAME,
	                placeHolder	: Messages.SESSION_NAME_PLACEHOLDER,
	                maxLength	: 50,
	                useClearIcon: true,
	                value		: course.name,
	            }, {
	                xtype		: 'textfield',
	                name		: 'shortName',
	                label		: Messages.SESSION_SHORT_NAME,
	                placeHolder	: Messages.SESSION_SHORT_NAME_PLACEHOLDER,
	                maxLength	: 8,
	                useClearIcon: true,
	                value		: course.shortName,
	            }]
			}, {
            	xtype		: 'textfield',
            	name		: 'keyword',
            	hidden 		: true,
            }, {
				xtype: 'button',
				cls  : 'centerButton',
				ui: 'confirm',
				text: Messages.SAVE,
				handler: this.onSubmit,
			}]
		}];
		
		ARSnova.views.home.NewSessionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('beforeactivate', this.getSessionIds);
		this.on('activate', this.generateNewSessionId);
		
		ARSnova.views.home.NewSessionPanel.superclass.initComponent.call(this);
	},
	
	onSubmit: function() {
		var values = this.up('panel').getValues();

		Ext.dispatch({
			controller	: 'sessions',
			action		: 'create',
			name		: values.name,
			shortName	: values.shortName,
			keyword		: values.keyword,
		})			
	},
	
	getSessionIds: function(){
		if(this.unavailableSessionIds.length == 0){
			ARSnova.sessionModel.getSessionIds({
				success: function(response){
					var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
					var res = Ext.decode(response.responseText).rows;
					res.forEach(function(el){
						panel.unavailableSessionIds.push(el.key);
					});
				},
				failure: function(){
					console.log('server-side error');
				}
			});
		}
	},
	
	generateNewSessionId: function(){
		var sessionIdInUse = false;
		/* don't use do-while-loop because of the risk of an endless loop */
		for ( var i = 0; i < 10000; i++) {
			var sessionId = Math.floor(Math.random()*100000001) + "";
			if (sessionId.length == 8) {
				var idx = this.unavailableSessionIds.indexOf(sessionId); // Find the index
				if(idx != -1) sessionIdInUse = true;
				else break;
			} else {
				sessionIdInUse = true; // accept only 8-digits sessionIds
			}
		}
		this.down("textfield[name=keyword]").setValue(sessionId);
		this.down('fieldset').setInstructions("Session-ID: " + ARSnova.formatSessionID(sessionId));
	},
});