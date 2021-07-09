var turn = 1;
$(function(){
    function numcell(){
        $("#aiui > tr").each(function(ind,val){
            $(val.children).each(function(ind2,val2){
                var cenu = $(this).text()
                if (cenu == "0"){
                    $(this).css("color", "white")
                    $(this).css("border-color", "black")                    
                } else if(cenu=="-1"){
                    $(this).css("background-color","black")
                }
            })
        })
    }
    
    function renumcell(celturn){
        $("#aiui").html("");
        $("#aiui").append("<tr></tr>".repeat(hei))
        $("#aiui > tr").each(function(ind,val){
            $(val).append("<td></td>".repeat(wid))
            $(val.children).each(function(ind2,val2){
                $(this).text(res[celturn-1][ind][ind2])
                $(this).css("color","black")
                $(this).css("background-color","white")
            })
        })
        $("#turndiv").text("現在ターン: " + celturn.toString())
        numcell()
    }
    
    $("#run_button").on("click", function(){
        //console.log(1);
        var cell_input = $("#cell_data").val().replace(/(\r\n|\n|\r)/, "").split("]]");
        cell_input = cell_input.slice(0,-1);
        cell_turns = cell_input.length;
        res = [];
        for (var i=0; i<cell_turns; i++){
            var cnow = cell_input[i].slice(1)
            //console.log(cnow);
            cnow = cnow.split("],");
            //console.log("afaef");
            var jres=[];
            for (var j=0; j<cnow.length; j++){
                //console.log(cnow[j]);
                cnow[j] = cnow[j].slice(cnow[j].lastIndexOf("[")+1);
                var cnowtemp = [];
                $(cnow[j].split(",")).each(function(ind, val){
                    cnowtemp.push(Number(val));
                })
                //console.log(cnowtemp)
                jres.push(cnowtemp)
            }
            //console.log(jres);
            res.push(jres)
        }
        turn = 1
        console.log(res)
        wid = res[0][0].length
        hei = res[0].length
        renumcell(1)
    });
    
    $("#pre_button").on("click", function(){
        if(turn>1){
            turn -= 1
            renumcell(turn)
            //$("#turndiv").text("現在ターン: " + turn.toString())
        }
        console.log(turn)
    })
    $("#fol_button").on("click", function(){
        if(turn < cell_turns){
            turn += 1
            renumcell(turn)
            //$("#turndiv").text("現在ターン: " + turn.toString())
        }
        console.log(turn)
    })
});