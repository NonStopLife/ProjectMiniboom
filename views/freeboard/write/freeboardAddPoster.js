/*
 * 함수 이름: addPoster()
 * 함수 설명: ajax를 활용하여 객체 형태로 데이터를 서버에 전달
 */
function addPoster(){
  var msg = new Object();
  msg.flag = "addPoster";
  msg.title = $("#title").val();
  msg.summernote = $('#summernote').summernote('code'); // html 코드로 내용 읽기
  console.log("summernoteContent : " + msg.summernote);

  if(msg.title == ""){
    return;
  }
  if(msg.summernote == ""){
    return;
  }

  console.log("2번째 로그:", msg);
  $.ajax({
    type: "POST",
    url: "https://miniboom.site/freeboard/write",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(msg),
    success: function(result) {
      console.log(result)
      window.open("https://miniboom.site/", "_self");
    }
  });

}
