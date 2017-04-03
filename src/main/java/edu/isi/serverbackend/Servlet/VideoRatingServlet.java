package edu.isi.serverbackend.Servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/rateHash")
public class VideoRatingServlet extends HttpServlet{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public VideoRatingServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		String id = request.getParameter("hashID");
		boolean vote = Boolean.parseBoolean(request.getParameter("vote"));
		
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
			System.out.println("VideoRatingServlet : ");
			if (vote){
				System.out.println("UPDATE hash_objects SET likes=likes+1 where id='"+id+"'");
				st.executeUpdate("UPDATE hash_objects SET likes=likes+1 where id='"+id+"'");
			}
			else{
				System.out.println("UPDATE hash_objects SET dislikes=dislikes-1 where id='"+id+"'");
				st.execute("UPDATE hash_objects SET dislikes=dislikes-1 where id='"+id+"'");
			}
			
			
		}
		catch (ClassNotFoundException e){
			 System.err.println("Could not connect to driver!");
			 System.err.println(e.getMessage());
			
		}
		catch (SQLException ex)
		{
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
