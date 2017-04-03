package edu.isi.serverbackend.Servlet;

import java.io.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.*;

import java.sql.*;

@WebServlet("/retrieveHash")
public class HashRetrievalServlet extends HttpServlet{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public HashRetrievalServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		PrintWriter out = response.getWriter();
		String id = request.getParameter("hashID");
		JSONObject result = new JSONObject();
		
		if (id!=null && id.trim().isEmpty()){
			response.setContentType("text/plain");
			response.setStatus(400);
			out.println("Empty hash ID");
			return;
		}
		
		Connection conn=null;
		Statement st=null;
		ResultSet rs=null;
		String password;
		try{  
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
			conn = DriverManager.getConnection(myUrl, "root", password);
			st = conn.createStatement();		 
			rs = st.executeQuery("SELECT hash,title,author FROM hash_objects where id='"+id+"'");
		  
			if (!rs.next()){
				response.setContentType("text/plain");
				response.setStatus(400);
				out.println("Error retrieving hash object");
				return;
			} 
			
			result.put("hash", rs.getString("hash"));
			result.put("title", rs.getString("title"));
			result.put("author", rs.getString("author"));
			//result.put("path", rs.getString("path"));
			//result.put("rating", rs.getInt("rating"));
			
			//Update the lastAccessed field
			st.executeUpdate("UPDATE hash_objects SET lastAccessed=CURRENT_TIMESTAMP() WHERE id='"+id+"'");
			
			response.setContentType("application/json");
			
		  
			response.setCharacterEncoding("UTF-8");
			out.println(result);
		}
		catch (ClassNotFoundException e){
			 System.err.println("Could not connect to driver!");
			 System.err.println(e.getMessage());
			
		}
		catch (SQLException ex)
		{
			System.err.println("SQLException: " + ex.getMessage()+", SQLState: " + ex.getSQLState() + "VendorError: " + ex.getErrorCode());
		}
		catch (JSONException ex){
			ex.printStackTrace();
		}
		finally{
			if (conn!=null){
				try{
					conn.close();
				}
				catch (SQLException ex){
					ex.printStackTrace();
				}
			}
			if (st!=null){
				try{
					st.close();
				}
				catch (SQLException ex){
					ex.printStackTrace();
				}
			}
			if (rs!=null){
				try{
					rs.close();
				}
				catch (SQLException ex){
					ex.printStackTrace();
				}
			}
		}
		
	}
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request, response);
	}

}


//Delete function example for deleting anything older than 60 days
//delete from hash_objects where DATEDIFF(CURRENT_TIMESTAMP(),lastAccessed)>60;