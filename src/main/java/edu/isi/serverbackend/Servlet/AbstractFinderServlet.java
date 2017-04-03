package edu.isi.serverbackend.Servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.NoSuchElementException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.engine.binding.Binding;

import com.hp.hpl.jena.query.QueryFactory;


@WebServlet("/descriptions")
public class AbstractFinderServlet extends HttpServlet{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
     * @see HttpServlet#HttpServlet()
     */
    public AbstractFinderServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//Always call the encoding before anything else
		response.setCharacterEncoding("UTF-8");
		
		PrintWriter out = response.getWriter();
		//HTTPRepository endpoint = new HTTPRepository("http://dbpedia.org/sparql", "");
		String allUris;
		String[] uris;
		JSONObject result = new JSONObject();
		//RepositoryConnection repoConnection = null;
		String jsonCallback = request.getParameter("jsoncallback");
		
		try {
			//endpoint.initialize();
			//repoConnection = endpoint.getConnection();
			allUris = request.getParameter("uri");
			uris=allUris.split(",");
			
			for(int i=0; i<uris.length; i++){
				String queryString =
				"PREFIX p: <http://dbpedia.org/property/> "+
				"PREFIX dbpedia: <http://dbpedia.org/resource/> "+ 
				"PREFIX category: <http://dbpedia.org/resource/Category:> "+ 
				"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "+ 
				"PREFIX dbo: <http://dbpedia.org/ontology/> "+ 
				"SELECT ?label ?abstract ?comment WHERE { " +
				"GRAPH <http://dbpedia.org> {" +
				"<" + uris[i] + "> rdfs:label ?label ."+
				"?x rdfs:label ?label ."+ 
				"?x dbo:abstract ?abstract ."+ 
				"?x rdfs:comment ?comment ."+ 
				"FILTER (lang(?abstract) = \"en\") ."+ 
				"FILTER (lang(?comment) = \"en\") ."+ 
				"FILTER (lang(?label) = \"en\") ."+ 
				"}} LIMIT 2 ";
				
				Query query = QueryFactory.create(queryString);
				QueryExecution qExe = QueryExecutionFactory.sparqlService( "http://lodstories.isi.edu:3030/integrated_dbpedia/query", query );
				ResultSet results = qExe.execSelect();

				if (results.hasNext()){					
					Binding binding = results.nextBinding();
					Iterator<Var> vars = binding.vars();
					String abstractString="";
					String commentString="";
					String typeString="";
					String labelString="";
					while(vars.hasNext()){
						
						Var var = vars.next();
						Node node = binding.get(var);
		    			String name = var.getVarName();
		    			String value;
		    			
		    			value = node.getLiteralValue().toString();
		    			
		    			if(name.equals("abstract")){
		    				abstractString = value;
		    			}
		    			else if (name.equals("comment")){
		    				commentString = value;
		    			}
		    			else if (name.equals("label")){
		    				labelString = value;
		    			}
					}

					JSONObject newNode = new JSONObject();
					newNode.put("abstract", formatString(abstractString));
					newNode.put("comment", formatString(commentString));
					
					newNode.put("label", labelString);
					
					result.put(uris[i], newNode);
				}
				else{
					System.out.println("No abstracts found for "+uris[i]);
					continue;
				}	
			}
			response.setContentType("application/json");
			
			out.println(jsonCallback + "(" + result.toString() + ")");
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private static String formatString(String desc){
		desc = cutParenthesis(desc);
		
		//Fix any spacing issues that may have arisen from killing the parenthesis, such as double spaces and spaces before punctuation
		desc = desc.replaceAll(" {2,}", " ");
		desc = desc.replaceAll(" ,", ",");
		desc = desc.replaceAll(" \\.", ".");
		
		return desc;
	}
	
	private static String cutParenthesis(String desc){
		if (desc.contains("(") && desc.contains(")")){
			if (desc.indexOf('(')<desc.indexOf(')'))
				return desc.substring(0,desc.indexOf('(')) + cutParenthesis(desc.substring(desc.indexOf('(')+1));
			else
				return cutParenthesis(desc.substring(desc.indexOf(')')+1));
		}
			
		if (desc.contains(")"))
			return desc.substring(desc.lastIndexOf(')')+1);
			
		return desc;
			
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}

//Properly formatted query
/*PREFIX p: <http://dbpedia.org/property/> 
PREFIX dbpedia: <http://dbpedia.org/resource/>  
PREFIX category: <http://dbpedia.org/resource/Category:> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  
PREFIX dbo: <http://dbpedia.org/ontology/> 
SELECT ?label ?abstract ?comment WHERE { 
GRAPH <http://dbpedia.org> {
<http://dbpedia.org/resource/Rainer_Maria_Rilke> rdfs:label ?label .
?x rdfs:label ?label . 
?x dbo:abstract ?abstract . 
?x rdfs:comment ?comment .
FILTER (lang(?abstract) = "en") . 
FILTER (lang(?comment) = "en") . 
FILTER (lang(?label) = "en") .
}} LIMIT 2 */
