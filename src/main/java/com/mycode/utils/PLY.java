/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycode.utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.smurn.jply.Element;
import org.smurn.jply.ElementReader;
import org.smurn.jply.ElementType;
import org.smurn.jply.PlyReader;
import org.smurn.jply.PlyReaderFile;
import org.smurn.jply.Property;


/**
 *
 * @author alexandra.mueller
 */
public class PLY {
    public static void startPLYUtils() {
        String filepath = PLY.class.getClassLoader().getResource("ply/points0.ply").getPath();
        
        
        //plyToXYZString(filepath); // read ply file into String for xyz format
        
        HashMap<Integer, Element> hm = plyVerticesToHashMap(filepath);
        filepath = PLY.class.getClassLoader().getResource("ply/projections22.ply").getPath();
        extract3DFrom2DToXYZString(hm, filepath);
        
    }
    
    private static String plyToXYZString(String filepath) {
        String out = "";
        try {
            PlyReader ply = new PlyReaderFile(filepath);

            int numberOfVertices = ply.getElementCount("vertex");

            int i = 0;
            ElementType type;
            do {
                type = ply.getElementTypes().get(i);
                i++;

            } while (!type.getName().equals("vertex")); // find type vertex

            ArrayList<String> props = new ArrayList<>();
            for (Property prop : type.getProperties()) {
                String name = prop.getName();
                if (name.equals("x") || name.equals("y") || name.equals("z")) {
                    props.add(name);
                }
            } // find out if xy or xyz

            ElementReader reader1 = ply.nextElementReader(); // first element reader (for vertices)
            Element e1 = reader1.readElement(); // first element in reader (first vertex)
            //int[] idList = e1.getIntList("id");
            while (e1 != null) {
                for (String prop : props) {
                    out += e1.getDouble(prop) + " ";
                }
                out += "\n";

                e1 = reader1.readElement();
            }
            reader1.close();

            /*
             fÃƒÂ¼r jeden elementtypen (z.b. vertex und face) gibt es einen eigenen reader. 
             nur wenn in der datei mindestens zwei elementtypen vorliegen, kann auch der zweite elementreader aufgerufen werden!
             */
//            System.out.println("################# READER 2 #######################");
//            ElementReader reader2 = ply.nextElementReader(); // first element reader
//            Element e2 = reader2.readElement();
//            while (e2 != null ) {
//                System.out.println(e2.toString());
//                
//                e2 = reader1.readElement();
//            }
            System.out.println("");

            ply.close();
        } catch (IOException ex) {
            Logger.getLogger(PLY.class.getName()).log(Level.SEVERE, null, ex);
        }
        return out;
    }

    private static HashMap<Integer, Element> plyVerticesToHashMap(String filepath) {
        HashMap<Integer, Element> hm = new HashMap<>();

        try {
            PlyReader ply = new PlyReaderFile(filepath);

            ElementReader reader = ply.nextElementReader(); // first element reader
            if (!reader.getElementType().getName().equals("vertex")) {
                throw new Exception("not the reader for vertices!");
            }

            Element elem = reader.readElement();
            do {
                hm.put(elem.getInt("id"), elem);
                elem = reader.readElement();
            } while (elem != null);

        } catch (IOException ex) {
            Logger.getLogger(PLY.class.getName()).log(Level.SEVERE, null, ex);
        } catch (Exception ex) {
            Logger.getLogger(PLY.class.getName()).log(Level.SEVERE, null, ex);
        }

        return hm;
    }

    private static String extract3DFrom2DToXYZString(HashMap<Integer, Element> hm, String filepath) {
        String out = "";
        try {
            PlyReader ply = new PlyReaderFile(filepath);
            ElementReader reader = ply.nextElementReader();
            
            Element elem2D = reader.readElement();
            int i = 0;
            do {
                int id = elem2D.getInt("id");
                Element elem3D = hm.get(id);
                if (elem3D == null) {
                    System.out.println("no point for id " + id);
                } else {
                    i++;
                    System.out.println("########## point found (" + id + ") ############");
                    out += elem3D.getDouble("x") + " " + elem3D.getDouble("y") + " " + elem3D.getDouble("z") + "\n";
                }
                elem2D = reader.readElement();
            } while (elem2D != null);

        } catch (IOException ex) {
            Logger.getLogger(PLY.class.getName()).log(Level.SEVERE, null, ex);
        }
        return out;
    }


}
