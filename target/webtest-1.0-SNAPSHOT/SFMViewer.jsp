<%-- 
    Document   : SFMViewer
    Created on : Sep 29, 2015, 3:50:42 PM
    Author     : alexandra.mueller
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>SFM-Viewer</title>
        

        <link href="css/simple.css" rel="stylesheet" type="text/css"/>
        <script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
        <script src="js/three.min.js" type="text/javascript"></script>
        <script src="js/OrbitControls.js" type="text/javascript"></script>
        <script src="js/init.js" type="text/javascript"></script>
        <script src="js/myThree.js" type="text/javascript"></script>
        <script src="data/pc_krieger.js" type="text/javascript"></script>
        <script src="js/OBJMTLLoader.js" type="text/javascript"></script>
        <script src="js/MTLLoader.js" type="text/javascript"></script>


    </head>
    <body onload="SV.Init.onload()">
        <div id="title"> SFM-Viewer</div>
        <div id="bigimg"><img></img></div>
        
        <div id="map">
            <div id="toggles">
                <a href="#" onclick="SV.Three.toggle(cams); return false;">Toggle Images</a>
                <a href="#" onclick="SV.Three.toggle(model); return false;">Toggle Model</a>
                <a href="#" onclick="SV.Three.toggle(pc); return false;">Toggle Pointcloud</a>
            </div>
        </div>
        <div id="images"></div>
    </body>
</html>
