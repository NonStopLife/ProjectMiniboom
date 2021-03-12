$(document).ready(function(){
    var toolbar = [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'hr']],
        ['view', ['fullscreen', 'codeview']],
        ['help', ['help']]
    ];

    var setting = {
        height : 300,
        minHeight: null,
        maxHeight: null,
        focus : true,
        lang : 'ko-KR',
        toolbar : toolbar
    };

    $('#summernote').summernote(setting);
});

var htmlStr = $('#summernote').summernote('code');
