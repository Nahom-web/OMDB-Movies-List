$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$("#submitMovies").on('click', function (){
    $("#nominationsSavedMessage").fadeTo(3000, .2).fadeTo(3000, 1.0);
});