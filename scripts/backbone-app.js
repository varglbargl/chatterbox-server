(function(){

  var App = {
    Models: {},
    Collections: {},
    Views: {}
  };

  App.Models.Message = Backbone.Model.extend({
    url: 'https://api.parse.com/1/classes/chatterbox',

    defaults: {
      idAttribute: 0,
      text: '',
      username: '',
      roomname: ''
    }
  });

  App.Collections.Messages = Backbone.Collection.extend({
    url: 'https://api.parse.com/1/classes/chatterbox',

    initialize: function() {

    },

    model: App.Models.Message,

    parse: function(messages) {
      return messages.results;
    }
  });

  // Collection view
  App.Views.Messages = Backbone.View.extend({
    tagName: 'div',
    className: 'messages',

    initialize: function() {
      var messageForm = new App.Views.MessageForm();
    },


    render: function() {
      var that = this;
      this.collection = new App.Collections.Messages();
      this.collection.fetch({ data: {limit: 20, order: '-createdAt'} }).done(function(){

        that.$el.html('');

        that.collection.each(function(message){
          var messageView = new App.Views.Message({ model: message });
          that.$el.append( messageView.el );
        }, that);

        $('#feed').html( that.el );
      });
    },

  });

  // Model View
  App.Views.Message = Backbone.View.extend({
    tagName: 'div',
    className: 'message',

    initialize: function() {
      this.render();
    },

    template: _.template( $('#messageViewTemplate').html() ),

    render: function() {
      this.$el.html( this.template(this.model.toJSON()) );
      return this;
    }

  });

  App.Views.MessageForm = Backbone.View.extend({
    tagName: 'div',
    className: 'sendMessage',

    initialize: function() {
      this.username = prompt('Please enter a username');
      this.render();
    },

    events: {
      'submit form': 'sendMessage'
    },

    template: _.template( $('#messageForm').html() ),

    render: function() {
      $('#feed').before( this.$el.html( this.template() ));
      return this;
    },

    sendMessage: function(e) {
      e.preventDefault();
      var that = this;
      data = { username: this.username, text: this.$el.find('.textBox').val(), roomname: 'hackReactor' };
      var msg = new App.Models.Message(data);
      msg.save();
      this.$el.find('.textBox').val('');
    }

  });


  var app = new App.Views.Messages();
  app.render();

  // setInverval to get messages and re-render view.
  setInterval(function(){
    app.render();
  }, 2000);


}());