package edu.isi.serverbackend.Servlet;

import java.io.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.sql.*;
import org.json.*;
/**
 *	This servlet merely searches the database and returns meta data about hash objects.
 *	It does NOT update the lastAccessed field, and does NOT return actual hash objects.
 *	To actually retrieve a hash object, one must use the retrieved hash ID to call the HashRetrievalServlet
 */
@WebServlet("/filterHash")
public class HashFilterServlet extends HttpServlet{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static int maxResults = 5;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public HashFilterServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		PrintWriter out = response.getWriter();
		String sourceFilter = request.getParameter("startNode");
		int startIndex=0;
		int i=0;
		try{
			startIndex = Integer.parseInt(request.getParameter("startIndex"));
		}
		catch(NumberFormatException e){
			startIndex = 0;
		}
		JSONObject result = new JSONObject();
		JSONArray hashObjects = new JSONArray();
		
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
			
			if (sourceFilter!=null && !sourceFilter.trim().isEmpty()){
				String queryString = "SELECT id,title,author,path,likes,dislikes,thumbnail FROM hash_objects WHERE path LIKE '"+sourceFilter+";%' ORDER BY (likes-dislikes) DESC,id ASC";
				System.out.println("HashFilterServlet : Fetching results of SQL Query : ");
				System.out.println(queryString);
				rs = st.executeQuery(queryString);
			}
			else{
				String queryString = "SELECT id,title,author,path,likes,dislikes,thumbnail FROM hash_objects ORDER BY (likes-dislikes) DESC,id ASC";
				System.out.println("HashFilterServlet : Fetching results of SQL Query : ");
				System.out.println(queryString);
				rs = st.executeQuery(queryString);
			}
		  
			if (!rs.next()){
				response.setContentType("text/plain");
				response.setStatus(400);
				out.println("No videos available");
				return;
			} 
			
			i++;
			while (i<=startIndex){
				rs.next();
				i++;
			}
			
			//Handle the first match before entering the while loop...
			JSONObject newNode = new JSONObject();
			newNode.put("hashID", rs.getString("id"));
			newNode.put("thumbnail", rs.getString("thumbnail"));
			newNode.put("title", rs.getString("title"));
			newNode.put("author", rs.getString("author"));
			newNode.put("path", rs.getString("path"));
			newNode.put("likes", rs.getInt("likes"));
			newNode.put("dislikes", rs.getInt("dislikes"));
			hashObjects.put(newNode);
			
			while (rs.next() && i<startIndex+maxResults){
				i++;
				newNode = new JSONObject();
				newNode.put("hashID", rs.getString("id"));
				newNode.put("thumbnail", rs.getString("thumbnail"));
				newNode.put("title", rs.getString("title"));
				newNode.put("author", rs.getString("author"));
				newNode.put("path", rs.getString("path"));
				newNode.put("likes", rs.getInt("likes"));
				newNode.put("dislikes", rs.getInt("dislikes"));
				hashObjects.put(newNode);
			}
			
			result.put("startingNode", sourceFilter);
			result.put("hashObjects",hashObjects);
			
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
			response.setContentType("text/plain");
			response.setStatus(400);
			out.println("No videos available");
			return;
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
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request, response);
	}

}


//Delete function example
//delete from hash_objects where lastModified<=DATE_SUB(NOW(), INTERVAL 1 MONTH);