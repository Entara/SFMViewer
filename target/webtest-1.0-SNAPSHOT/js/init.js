var SV = {};
SV.Init = {};
SV.Init.data;

SV.Init.onload = function () {
    //SV.Init.loadImages();
    SV.Init.loadData();
    
    SV.Three.startMap();
};

SV.Init.loadData = function () {
    var url = "http://localhost:8084/viewer";

    $.ajax({
        type: "GET",
        url: url,
        data: {'image': 'all'},
        success: function (data) {
            data = JSON.parse(data);
            SV.Init.data = data;
            $.each(data, function (i, value) {
                $("#images").append($("<img class='imgsmall' id='" + value.name + "' src=" + value.url + " >"));
            });
            //$("#bigimg img").attr("src", data[0].url).attr("imgid", data[0].name).load();
            reloadBigImg(data[0].url, data[0].name);
        },
        error: function () {
            alert("error");
        }
    });
    
    
};

function reloadBigImg(src, imgid) {
    $("#bigimg img")
            .attr("src", src)
            .attr("imgid", imgid)
            .load();
    
};

$(document).on('click', '.imgsmall', function () {
    reloadBigImg($(this).attr("src"), $(this).attr("di"));
    
});

