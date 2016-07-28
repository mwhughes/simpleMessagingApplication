Chats = new Mongo.Collection("chats");


if (Meteor.isClient) {
  //Subscribe to database collections
  Meteor.subscribe("chats");
  Meteor.subscribe("userData");

  // set up the main template the the router will use to build pages
    Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });
  // specify the top level route, the page users see when they arrive at the site
  Router.route('/', function () {
    //console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});  
  });

  // specify a route that allows the current user to chat to another users
  Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to 
    // the id sent in after /chat/... 
    var otherUserId = this.params._id;
    Session.set("otherId", otherUserId);
    var thisUserId = Meteor.userId();
    // find a chat that has two users that match current user id
    // and the requested user id
    var filter = {$or:[
                {user1Id:Meteor.userId(), user2Id:otherUserId}, 
                {user2Id:Meteor.userId(), user1Id:otherUserId}
                ]};
    var chat = Chats.findOne(filter);
    if (!chat&&Meteor.userId()){// no chat matching the filter - need to insert a new one as long as user is logged in
      chatId = Meteor.call("createChat", thisUserId, otherUserId);
    }
    else {// there is a chat going already - use that. 
      chatId = chat._id;
    }
    if (chatId){// looking good, save the id to the session
      Session.set("chatId",chatId);
    }
    //console.log(chatId);
    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});  
  });

  ///
  // helper functions 
  /// 
  Template.available_user_list.helpers({
    users:function(){
     // console.log(Meteor.users.find());
      return Meteor.users.find();
    }
  })
 Template.available_user.helpers({
    getUsername:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    }, 
    getUserFirstName:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.firstName;
    }, 
    getUserLastName:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.lastName;
    }, 
      getUserObjectProfile:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile;
    }, 
    isMyUser:function(userId){
      if (userId == Meteor.userId()){
        return true;
      }
      else {
        return false;
      }
    }
  })


  Template.chat_page.helpers({
    messages:function(){
      var chat = Chats.findOne({_id:Session.get("chatId")});

      return chat.messages;
    }, 
    other_user:function(){
      user = Meteor.users.findOne({_id: Session.get("otherId")});
      return user.profile.username;
    }, 
    //experimental function to try to get emoticons in the form. 
    this_user:function(){
      user = Meteor.users.findOne({_id:Meteor.userId()});
      return user.profile.username;
    }, 


  })
Template.chat_message.helpers({
    getUsername:function(userIDVal){
      user = Meteor.users.findOne({ _id : userIDVal});
      return user.profile;
      //
    }
  })
Template.emoticon_box.helpers({
    emoticonObjects:function(){
      var emoticonList = [":smile:", ":blush:", ":smirk:", ":heart_eyes:", ":kissing_heart:", ":flushed:", ":relieved:", ":satisfied:", 
                           ":grin:", ":wink:", ":stuck_out_tongue_winking_eye:", ":stuck_out_tongue_closed_eyes:", ":grinning:", ":kissing:", 
                           ":kissing_smiling_eyes:", ":stuck_out_tongue:", ":sleeping:", ":worried:", ":frowning:", ":anguished:", ":open_mouth:", 
                           ":grimacing:",  ":confused:", ":hushed:",  ":expressionless:",  ":unamused:",  ":sweat_smile:",  ":sweat:",  ":disappointed_relieved:", 
                            ":weary:", ":pensive:", ":disappointed:",  ":confounded:",  ":fearful:",  ":cold_sweat:",  ":persevere:", 
                            ":cry:", ":sob:", ":joy:",  ":astonished:",  ":scream:", ":tired_face:", ":angry:", ":rage:",
                            ":triumph:", ":sleepy:", ":yum:", ":mask:", ":sunglasses:", ":dizzy_face:", ":imp:", ":smiling_imp:", ":neutral_face:", ":no_mouth:", ":innocent:", ":alien:",
                            ":boom:", ":anger:", ":exclamation:", ":question:", ":grey_exclamation:", ":grey_question:", ":zzz:", ":dash:", ":sweat_drops:", ":notes:"
                            
                           ];
      var emoticonObjList=[];
      //lconsole.log(emoticonList.length);
      for (var j=0; j<emoticonList.length; j++){
        //console.log(j);
        emoticonObjList.push({"emotiName": emoticonList[j]});
      }
      //console.log(emoticonObjList);
      return emoticonObjList;
    }
  })
/*
submitFunction = function(event){
    
      /*var objDiv = $('.chat_well');
      objDiv[0].scrollTop = objDiv[0].scrollHeight;
      console.log(objDiv[0].scrollTop);
      console.log(objDiv[0].scrollHeight);
      
      
     
    };
    */

 Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat': function (event) {
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message
    var chat = Chats.findOne({_id:Session.get("chatId")});
    if (chat){// ok - we have a chat to use
      var msgs = chat.messages; // pull the messages property
      if (!msgs){// no messages yet, create a new array
        msgs = [];
      }
      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not. 
      // push adds the message to the end of the array
      if (/\S/.test(event.target.chat.value))      {
        msgs.push({text: event.target.chat.value, userIDVal: Meteor.userId()});
        //console.log(event.target.chat.value);
      }
      

      // reset the form
      event.target.chat.value = "";
      // put the messages array onto the chat object
      chat.messages = msgs;
      // update the chat object in the database using a method call.
      Meteor.call("updateChat", chat._id, chat);
      //Chats.update(chat._id, chat)
          //scroll down to the bottom of the chat 
      $(".chat_well").animate({ scrollTop: $(".chat_well")[0].scrollHeight}, 500);
      }
  },
  

  'click .js-test-emoticon': function(event){
    //event.preventDefault();
    var k = $(event.target).prop("alt");
    if (!k){k="";}
    var testVal = $('textarea').val() + k;

    /*
    console.log( $(event.target).parent() );
    console.log($(event.target).prop("alt"));
    console.log($(event.target).parent().prop("tagName"));
    console.log($(event.target).parent().prop("data-emojiText"));
    console.log($(event.target).parent().data("emojiText"));
    
    console.log(event.target.tagName);
     console.log($(event.target.categ).data("emojiText"));
    console.log($(this).data("emojiText"));
    console.log($(this).val());
    */
    $('textarea').val(testVal);
  },

  'keydown textarea' : function(e){
    
    if (e.which==13){
     
     $('.js-send-chat').trigger('submit');
    }
  }

 });
}


// start up script that creates some users for testing
// users have the username 'user1@test.com' .. 'user8@test.com'
// and the password test123 

if (Meteor.isServer) {
  //Publish collections that client should have access to
  Meteor.publish("chats", function(){
    var filter = {$or:[{$and: [{user1Id:this.userId}, {user1Id: {$ne : null}}, { user2Id: {$ne : null} }]}, // 
                {$and: [{user2Id:this.userId}, {user1Id: {$ne : null}},{ user2Id: {$ne : null} }]}
                ]};
    return Chats.find(filter);
  });

  Meteor.publish("userData", function(){
    return Meteor.users.find({},
                             {fields: {'profile': 1}})

  });

  Meteor.methods({
    updateChat : function(chatId, chat){
      if (!this.userId){return;}
      else{
          Chats.update(chat._id, chat)
      }
    },
    createChat: function(thisUserId, otherUserId){
        return Chats.insert({user1Id:thisUserId, user2Id:otherUserId});
    }

  });

  //Setup dummy accounts if there aren't.
  Meteor.startup(function () {
    if (!Meteor.users.findOne()){
      for (var i=1;i<9;i++){
        var email = "user"+i+"@test.com";
        var username = "user"+i;
        var avatar = "ava"+i+".png"
        console.log("creating a user with password 'test123' and username/ email: "+email);
        Meteor.users.insert({profile:{username:username, avatar:avatar}, emails:[{address:email}],services:{ password:{"bcrypt" : "$2a$10$I3erQ084OiyILTv8ybtQ4ON6wusgPbMZ6.P33zzSDei.BbDL.Q4EO"}}});
      }
    } 
  });
}