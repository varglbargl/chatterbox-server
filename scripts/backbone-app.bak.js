var app = {};

app.Message = Backbone.Model.extend({
  initialize: function(data) {
  },
  defaults: {
    objectId: 0,
    username: 'Some Username',
    text: 'Message text goes here',
    roomname: 'HackReactor'
  },
  url: 'https://api.parse.com/1/classes/chatterbox/' + this.objectId
});

app.MessageCollection = Backbone.Collection.extend({
  url: 'https://api.parse.com/1/classes/chatterbox',
  model: app.Message,
  numMessages: 10,
  initialize: function() {
    console.log('Collection initialize');
    this.fetch({
      data: {limit: this.numMessages, order: '-createdAt'},
      success: function(messages){
        var render = new app.MessageView({collection: messages});
      }
    });
  },
  parse: function(response) {
    return response.results;
  }
});

app.MessageView = Backbone.View.extend({
  initialize: function() {
    // console.log($('#messageViewTemplate').html());
    this.render(this.collection);
  },

  events: {
    'click .username': 'addFriend'
  },

  addFriend: function(event) {
    $(event.currentTarget).addClass('friend');
  },

  template: _.template($('#messageViewTemplate').html()),

  el: $('.messages'),
  render: function(messages) {
    var that = this;
    console.log('testing', messages);
    _.each(messages.models, function(message){
      $('.messages').append(that.template(message.attributes));
    });
    return this;
  }
});

$(document).ready(function(){
  var msgs = new app.MessageCollection();

  setInterval(function(){
    msgs.fetch({update: true});
  }, 2000);

});
