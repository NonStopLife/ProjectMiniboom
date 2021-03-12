console.log("main_logout_local.js");

$("#nonMember").click(function() {
  console.log("비회원 처리합니다");
  var msg={
    flag : "nonMember"
  }
  $.ajax({
    type: "POST",
    url: window.location.href+"nonMember",
    dataType: 'json',
    data: JSON.stringify(msg),
    contentType: 'application/json',
    success: function(result) {
      window.open(window.location.href,"_self");
    }
  });
});
