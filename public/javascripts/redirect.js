
function connectHTTPS(){
  var protocol = window.location.protocol;
  var hostname = window.location.hostname;

  if(protocol == "http:"){
    console.log("not http");
    window.open("https:" + hostname, "_self");
  } else{
    console.log("welcome")
  }
}
