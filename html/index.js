var cell_array = Array();
$(function(){
    var cell_input;
    $("#run_button").on("click", function(){
        cell_input = $("#cell_data").val().replace(/(\r\n|\n|\r)/, "").split("]]");
        cell_turns = cell_input.length
        for (var i=0; i<cell_turns - 1; i++){
            cell_array.push(cell_input[i].replace(/(\r\n|\n|\r)/, "").slice(1) + "]");
        }
    });
});