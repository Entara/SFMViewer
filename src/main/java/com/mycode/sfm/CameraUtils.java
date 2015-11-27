package com.mycode.sfm;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.json.JSONArray;
import org.json.JSONObject;
/**
 *
 * @author alexandra.mueller
 */
public class CameraUtils {
    static String HOST = "http://localhost:8084/";
    
    public static void getCamsInfo(HttpServletRequest req, HttpServletResponse res) {
        JSONArray camsArr = new JSONArray();
        camsArr = readCameraExportXML(camsArr);
        
        File imgfolder = new File(req.getSession().getServletContext().getRealPath("/images"));
        camsArr = addImgURLs(camsArr, imgfolder);
        
        try (PrintWriter out = res.getWriter();){
            out.write(camsArr.toString());
        } catch (IOException ex) {
            Logger.getLogger(CameraUtils.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    private static JSONArray readCameraExportXML(JSONArray camsArr) {
        
        String filepath = CameraUtils.class.getClassLoader().getResource("cam_xml.xml").getPath();
        try (FileInputStream fis = new FileInputStream(filepath)) {
            String d = IOUtils.toString(fis);
            
            //XML Parsen
			SAXBuilder builder = new SAXBuilder();
			Reader in = new StringReader(d);

			Document doc = (Document) builder.build(in);
            List<Element> chunk = doc.getRootElement().getChildren("chunk");
            List<Element> camsList = new ArrayList<>();
            
            for(Element c : chunk) {
                for(Element nextCams : (List<Element>)c.getChildren("cameras")) {
                    camsList.addAll(nextCams.getChildren("camera"));
                }
            }
            
            
            for(Element camElem : camsList) {
                JSONObject camJSON = new JSONObject();
                
                String name = camElem.getAttributeValue("label");
                camJSON.put("name", name);
                
                String matrix = camElem.getChildText("transform");
                JSONArray matrixArr = new JSONArray();
                for(String v : matrix.split(" ")) {
                    matrixArr.put(Float.parseFloat(v));
                    
                }
                camJSON.put("matrix", matrixArr);
                
                camsArr.put(camJSON);
            }
            
            System.out.println(camsArr);
            
            
        } catch (IOException ex) {
            Logger.getLogger(CameraUtils.class.getName()).log(Level.SEVERE, null, ex);
        } catch (JDOMException ex) {
            Logger.getLogger(CameraUtils.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        return camsArr;
    }
    
    private static JSONArray addImgURLs(JSONArray camsArr, File imgfolder) {
        File[] listFiles = imgfolder.listFiles();
        for (File f : listFiles) {
            for (int i = 0; i < camsArr.length(); i++) {
                    JSONObject o = camsArr.getJSONObject(i);
                    if (f.getName().equals(o.getString("name"))) {
                        o.put("url", HOST + f.getParentFile().getName() + "/" + f.getName());
                    }
                }
        }

        return camsArr;
    }

    public static void getImagesFromFolder(HttpServletRequest req, HttpServletResponse res) throws IOException {
        File folder = new File(req.getSession().getServletContext().getRealPath("/images"));
        System.out.println(folder.getAbsoluteFile());
        List<String> list = new ArrayList<>();
        for (File f : folder.listFiles()) {
            list.add(HOST + f.getParentFile().getName() + "/" + f.getName());
        }
        JSONArray arr = new JSONArray(list);
        PrintWriter out = res.getWriter();
        out.write(arr.toString());
        out.close();
    }

    public static void getCameraData(HttpServletRequest req, HttpServletResponse res) {
        String filepath = Viewer.class.getClassLoader().getResource("data.txt").getPath();
        JSONArray data;
        try (final FileInputStream fis = new FileInputStream(filepath); PrintWriter out = res.getWriter();) {
            String d = IOUtils.toString(fis);
            data = new JSONArray(d);
            System.out.println(d);
            File imgfolder = new File(req.getSession().getServletContext().getRealPath("/images"));
            for (File f : imgfolder.listFiles()) {
                for (int i = 0; i < data.length(); i++) {
                    JSONObject o = data.getJSONObject(i);
                    if (f.getName().equals(o.getString("name"))) {
                        o.put("url", HOST + f.getParentFile().getName() + "/" + f.getName());
                    }
                }
            }
            
            out.write(data.toString());
        } catch (IOException ex) {
            Logger.getLogger(Viewer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
