Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    tagPicker: null,
    tagNamesToExclude: [],

    items: [
        {
            xtype: 'container',
            itemId: 'widgets'
        },
        {
            xtype: 'container',
            itemId: 'grid'
        }
    ],

    launch: function() {

    	var me = this;

    	this.tagPicker = Ext.create('Rally.ui.picker.TagPicker', {
    		itemId:'tagpicker'
    	});


    	this.down('#widgets').add(this.tagPicker);

        this.down('#widgets').add({
	        xtype: 'rallybutton',
	        text: 'Get Stories',
	        handler: function() { 
	         	me._renderGrid();
	     	}

        });

    },

    _renderGrid: function() {

    	var me = this;
    	var selectedTagRecords = this.tagPicker._getRecordValue();

   		Ext.Array.each(selectedTagRecords, function(record) {
    		me.tagNamesToExclude.push(record.get('Name'));
    	});

    	Ext.create('Rally.data.wsapi.Store', {
            model: 'UserStory',
            autoLoad: true,
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        });

    },

    _onDataLoaded: function(store, data) {

    	var me = this;
        var records = [];

        Ext.Array.each(data, function(record) {
            //Perform custom actions with the data here
            //Calculations, etc.
            console.log(record);
            var storyTags = record.get('Tags');
            var doesStoryHaveExcludedTags = false;
            var tagString = '';

            console.log(storyTags);

            Ext.Array.each(storyTags, function(storyTag) {
            	tagString += storyTag.Name + ", ";
            	console.log(tagString);
            	Ext.Array.each(me.tagNamesToExclude, function(excludedTag){
            		if (excludedTag !== storyTag.Name) {
            			doesStoryHaveExcludedTags = true;
            		}
            	});
            });

            if (doesStoryHaveExcludedTags === false) {
	            records.push({
	            	FormattedID: record.get('FormattedID'),
	                Name: record.get('Name'),
	                Tags: tagString,
	                ScheduleState: record.get('ScheduleState')
				});    
	        }
        });

        this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: records,
                pageSize: 50
            }),
            columnCfgs: [
                {
                    text: 'FormattedID', dataIndex: 'FormattedID', flex: 1
                },            
                {
                    text: 'Name', dataIndex: 'Name', flex: 1
                },
                {
                    text: 'Schedule State', dataIndex: 'ScheduleState'
                },
                {
                    text: 'Tags', dataIndex: 'Tags'
                }
            ]
        });
    }
 });