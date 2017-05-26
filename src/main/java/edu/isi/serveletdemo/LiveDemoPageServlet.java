package edu.isi.serveletdemo;

import java.io.BufferedReader;
//import java.io.BufferedWriter;
//import java.io.File;
//import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class LinkRankingServlet
 */
@WebServlet("/LiveDemoPageServlet")
public class LiveDemoPageServlet extends HttpServlet {
    
    //private static final long serialVersionUID = 1L;

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/**
     * @see HttpServlet#HttpServlet()
     */
    public LiveDemoPageServlet() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // TODO Auto-generated method stub
        System.out.println("livedemo servlet doGet " + request);
    }
    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //Always call the encoding before anything else
		response.setCharacterEncoding("UTF-8");
		PrintWriter out = response.getWriter();
		try {
			String subject = request.getParameter("subject");
	        String predicate = request.getParameter("predicate");
	        String object = request.getParameter("object");    				
			String chosenString = request.getParameter("chosen");
			boolean chosen = Boolean.parseBoolean(chosenString);
            
			
			String password;
			//Read the SQL password from a file
			BufferedReader reader = null;
			try{
				InputStream inputStream = getClass().getClassLoader().getResourceAsStream("SQLpw.txt");
				reader = new BufferedReader(new InputStreamReader(inputStream));
				password = reader.readLine();
			}
			catch (NullPointerException e){
				e.getStackTrace();
				password = "";
			}
			// create a mysql database connection
			String myDriver = "com.mysql.jdbc.Driver";
			String myUrl = "jdbc:mysql://localhost/lodstories";
			Class.forName(myDriver);			
			Connection connection = DriverManager.getConnection(myUrl, "root", password);

			Statement statement = connection.createStatement();  
		    statement.setQueryTimeout(30);  // set timeout to 30 sec.
		    
		    if (chosen){
		    	String stmt = "UPDATE path_explorer SET chosen=chosen+1,appearances=appearances+1 WHERE subject='"+subject+"' AND predicate='"+predicate+"' AND object='"+object+"'";
			    int updated = 0;
			    
			    System.out.println(stmt);
			    
			    updated = statement.executeUpdate(stmt);
			    
			    //Triple does not exist in database, so insert it...though this seriously shouldn't get called
			    if (updated==0){
			    	System.out.println("Trying to rate a nonexistent triple as interesting...");
			    	stmt= String.format("insert into path_explorer(subject, predicate, object,appearances,chosen) values('%s','%s','%s','%d','%d')", 
				    		subject, predicate, object, 1,1);			    	
			    	System.out.println(stmt);			    	
				    statement.execute(stmt);				    				    
			    }
		    }
		    else{
			    String stmt = "UPDATE path_explorer SET appearances=appearances+1 WHERE subject='"+subject+"' AND predicate='"+predicate+"' AND object='"+object+"'";
			    int updated = 0;
			    System.out.println(stmt);
			    updated = statement.executeUpdate(stmt);
			    
			    //Triple does not exist in database, so insert it
			    if (updated==0){
			    	stmt= String.format("insert into path_explorer(subject, predicate, object,appearances,chosen) values('%s','%s','%s','%d','%d')", 
				    		subject, predicate, object, 1,0);
			    	System.out.println(stmt);
				    statement.execute(stmt);
			    }
		    }
			         
		} catch (Exception e) {
			e.printStackTrace();
		}finally{
			out.flush();
			out.close();
		}
    	
        response.setStatus(HttpServletResponse.SC_OK);
    }

}
