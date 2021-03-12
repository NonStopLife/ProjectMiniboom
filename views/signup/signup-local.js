$("#email").blur(function() {
  var msg = {
    flag: $(this)[0].id,
    content: $(this).val()
  };
  Checking(msg);
});

$("#userid").blur(function() {
  var msg = {
    flag: $(this)[0].id,
    content: $(this).val()
  };
  Checking(msg);
});

$("#pw").blur(function() {
  var msg = {
    flag: $(this)[0].id,
    content: $('#pw').val(),
    content2: $('#pw-repeat').val()
  };
  Checking(msg);
});

$("#pw-repeat").blur(function() {
  var msg = {
    flag: $(this)[0].id,
    content: $('#pw').val(),
    content2: $('#pw-repeat').val()
  };
  Checking(msg);
});

function Checking(msg) {
  $.ajax({
    type: "POST",
    url: window.location.href, //"https://miniboom.site/signup",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      result_text(result);
    }
  });
}

function result_text(msg) {
  //$("." + msg.flag + "-text").text(msg.text);
  if (msg.shake) {
    $(msg.flag).css({"box-shadow": "0 0 0 0.2rem red"});
    shaking($(msg.flag).parent());
  }
  else{
    $(msg.flag).css({"box-shadow": "none"});
  }

}

function shaking(div) {
  $(div).animate({
    left: '10'
  }, 'fast');
  $(div).animate({
    left: '0'
  }, 'fast');
  $(div).animate({
    left: '10'
  }, 'fast');
  $(div).animate({
    left: '0'
  }, 'fast');
}

$("#joinbtn").click(function() {
  var msg = {
    userid: $('#userid').val(),
    email: $('#email').val(),
    pw: $('#pw').val()
  };
  $.ajax({
    type: "POST",
    url: window.location.href + "/process",//"http://miniboom.site/signup/process",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      if (result) {
        window.open("http://miniboom.site/signup/confirmEmail", "_self");
      } else {
        return;
      }
    }
  });
});
