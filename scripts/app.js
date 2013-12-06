var ChatterBox = function(){
  this.url = 'https://api.parse.com/1/classes/chatterbox';
  this.numMessages = 10;
  this.username = (prompt('What is your name?') || 'anonymous');
  this.room = undefined;
  this.friends = {};
  this.roomList = {};
};

ChatterBox.prototype.ajax = function(options) {
  $.ajax({
    url: options.url,
    data: options.data,
    type: options.type,
    contentType: options.contentType,
    success: options.success
  });
};

ChatterBox.prototype.toggleFriend = function(username) {
  if(username in this.friends) {
    delete this.friends[username];
  } else {
    this.friends[username] = true;
  }

  this.friendAnnounce(username);
  return true;
};

ChatterBox.prototype.friendAnnounce = function(friendName) {
  if (friendName in this.friends) {
    this.postMessage(this.username, friendName + " and " + this.username + " are now friendlies", this.room);
  } else {
    this.postMessage(this.username, friendName + " and " + this.username + " are no longer BFFs", this.room);
  }
};

ChatterBox.prototype.getMessages = function() {
  var that = this;
  var query = {limit: this.numMessages, order: '-createdAt'};

  if (this.room !== undefined) {
    query['where'] = {roomname: this.room};
  }

  this.ajax({
    url: that.url,
    data: query,
    type: 'GET',
    success: function(data){
      that.messageDisplay(data.results);
    }
  });

  // $.ajax({
  //   url: this.url,
  //   data: query,
  //   type: 'GET',
  //   success: function(data){
  //     that.messageDisplay(data.results);

  //   }
  // });
};

ChatterBox.prototype.roomDisplay = function() {
  var that = this;

  this.ajax({
    url: that.url,
    data: {limit: 100, order: '-createdAt'},
    type: 'GET',
    success: function(data){

      _.each(data.results, function(message) {
        if(!(message.roomname in that.roomList)) {
          var room = that.sanatize(message.roomname);
          that.roomList[room] = true;
          $('.rooms').append('<option value="' + room + '">' + room + '</option>');
        }
      });
    }
  });
};

ChatterBox.prototype.postMessage = function(username, message, roomname) {
  var that = this;

  return this.ajax({
    url: that.url,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({username: username, text: message, roomname: roomname}),
    success: function(data){
      return true;
    },
    error: function(){
      return false;
    }
  });
};

ChatterBox.prototype.messageDisplay = function(messages) {
  var that = this;

  messages = messages.reverse();

  var results = [];

  _.each(messages, function(message) {

    var classes = "username";
    if(message.username in that.friends) {
      classes += " friend";
    }

    results.push($('<div class="message">' +
                    '<span class="' + classes + '">' +
                    that.sanatize(message.username) +
                    '</span> ' +
                    that.sanatize(message.text) +
                    ' <span class="timeStamp" data-timestamp="' +
                    message.updatedAt +
                    '">' +
                    moment(message.updatedAt).startOf().fromNow() +
                    '</span><span class="messageRoomName"> ' +
                    that.sanatize(message.roomname) +
                    '</span></div>'));

  });

  $('.messages').html(results);

  // Add / remove friend
  $('.username').on('click', function(event) {
    event.preventDefault();
    that.toggleFriend($(this).text());
  });
};

ChatterBox.prototype.sanatize = function(string) {
  return $('<div></div>').text(string).html();
};


$(document).ready(function() {
  var chat = new ChatterBox();

  $('.textMessage').submit(function(event){
    event.preventDefault();
    var $messageInput = $('.textMessage input[type=text]');
    var msg = $messageInput.val();

    if(chat.postMessage(chat.username, msg, chat.room)) {
      $messageInput.val("");
    }

  });

  $('.rooms').change(function(event) {
    event.preventDefault();
    chat.room = $(this).val();
  });

  $('.newRoom').submit(function(event) {
    event.preventDefault();

    chat.room = $(this).find('input').val();
  });

  setInterval(function(){
    chat.roomDisplay();
    chat.getMessages();
  }, 1000);
});
