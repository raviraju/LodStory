package edu.isi.serverbackend.linkedData;

import java.util.*;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import edu.isi.serverbackend.linkedData.LinkedDataTriple.CurrentNode;
import edu.isi.serverbackend.feature.util.*;

import org.openrdf.query.MalformedQueryException;
import org.openrdf.query.QueryEvaluationException;
import org.openrdf.repository.*;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.engine.binding.Binding;


public class LinkedDataNode {
	
	public static final String LOCAL_SPARQL_ENDPOINT = "http://data.americanartcollaborative.org/sparql_lod_aac";
	public static final String DB_SPARQL_ENDPOINT = "http://dbpedia.org/sparql";
	//public static final String LOCAL_SPARQL_ENDPOINT = "http://localhost:3030/integrated_aac/query";

	private String name;
	private String uri;
	private RepositoryConnection repoConnection;
	private String typeURI;
    private String image;
	
	public LinkedDataNode(String uri, RepositoryConnection connection) throws RepositoryException, MalformedQueryException, QueryEvaluationException{
		this.uri = uri;
		this.repoConnection = connection;
		retrieveNameAndType(false);
	}
	
	public LinkedDataNode(String uri, String name, RepositoryConnection connection){
		this.uri = uri;
		this.name = name;
		this.repoConnection = connection;
	}
	
	public LinkedDataNode(String uri, String name, String typeURI, RepositoryConnection connection){
		this.uri = uri;
		this.name = name;
		this.typeURI = typeURI;
		this.repoConnection = connection;
	}
	
    public LinkedDataNode(String uri, String name, String typeURI, RepositoryConnection connection, String image){
        this.uri = uri;
        this.name = name;
        this.typeURI = typeURI;
        this.repoConnection = connection;
        this.image = image;
    }
    
	public void retrieveNameAndType(boolean remote) throws RepositoryException, MalformedQueryException, QueryEvaluationException{
		String queryString = "SELECT ?label ?type WHERE { GRAPH ?g {{ "
				+ "<" + uri + "> <http://www.w3.org/2000/01/rdf-schema#label> ?label . " 
				+ "<" + uri + "> a ?type . "
                + "FILTER(?type = <http://dbpedia.org/ontology/Person> || "
                + "?type = <http://dbpedia.org/ontology/Place> || "
                + "?type = <http://dbpedia.org/ontology/Organisation> || "
                + "?type = <http://dbpedia.org/ontology/Work> || "
                + "?type = <http://dbpedia.org/ontology/Event>). "
				+" FILTER(langMatches(lang(?label), \"EN\")) } }} LIMIT 500 ";
		


		System.out.println("Using SPARQL EndPoint: " + DB_SPARQL_ENDPOINT);
		System.out.println("retrieveNameAndType		RUN SPARQL: " + queryString);
    	Query query = QueryFactory.create(queryString);
    	QueryExecution qExe = QueryExecutionFactory.sparqlService( DB_SPARQL_ENDPOINT, query);
    	ResultSet results = qExe.execSelect();
    	//ResultSetFormatter.out(System.out, results, query) ;
    	while(results.hasNext()){
    		Binding binding = results.nextBinding();
    		Iterator<Var> vars = binding.vars();
    		String label = "";
    		String type = "";
    		while(vars.hasNext()){
    			Var var = vars.next();
    			Node node = binding.get(var);
    			String name = var.getVarName();
    			String value;
    			if(node.isURI())
    				value = node.getURI();
    			else
    				value = node.getLiteralValue().toString();
    			
    			if(name.equals("label"))
    				label = value;
    			else if(name.equals("type"))
    				type = value;
    		}
    		System.out.println("label : " + label);
    		System.out.println("type : " + type);
    		this.name = label;
    		this.typeURI = type;
    	}
	}
	
	public void retrieveObjectExtensions(List<Sample> samples, boolean remote) throws RepositoryException, MalformedQueryException, QueryEvaluationException{

		String queryString = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
				   + "PREFIX owl: <http://www.w3.org/2002/07/owl#> "
				   + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " 
				   + "SELECT DISTINCT ?predicate ?object ?label ?type WHERE{ "
                   + "<"+ uri + "> ?predicate ?object . "
                   + "?predicate rdf:type owl:ObjectProperty . "
                   + "?object a owl:Thing . "
                   + "?object rdfs:label ?label . "
                   + "?object a ?type. "
                   + "FILTER(?type = <http://dbpedia.org/ontology/Person> || "
                   + "?type = <http://dbpedia.org/ontology/Place> || "
                   + "?type = <http://dbpedia.org/ontology/Organisation> || "
                   + "?type = <http://dbpedia.org/ontology/Work> || "
                   + "?type =<http://dbpedia.org/ontology/Event>). "
                   + "FILTER(langMatches(lang(?label), \"EN\")) "
                   + "} LIMIT 500";
//		System.out.println(queryString);
//		TupleQuery query = repoConnection.prepareTupleQuery(QueryLanguage.SPARQL, queryString);
//		TupleQueryResult result = query.evaluate();
//		
//		while(result.hasNext()){
//			BindingSet bindingSet = result.next();
//			Literal objectLiteral = (Literal)bindingSet.getValue("label");
//			String language = objectLiteral.getLanguage();
//			if(language != null){
//				if(objectLiteral.getLanguage().equals("en")){
//					LinkedDataNode objectNode = new LinkedDataNode(bindingSet.getValue("object").stringValue(), objectLiteral.getLabel(), bindingSet.getValue("type").stringValue(), repoConnection);
//					LinkedDataTriple newTriple = new LinkedDataTriple(this, objectNode, bindingSet.getValue("predicate").stringValue(), CurrentNode.subject, repoConnection);
//					samples.add(new Sample(newTriple));
//				}
//			}
//		}

		System.out.println("\t Using SPARQL EndPoint: " + DB_SPARQL_ENDPOINT);
		System.out.println("\t RUN SPARQL: " + queryString);
    	Query query = QueryFactory.create(queryString);
    	QueryExecution qExe = QueryExecutionFactory.sparqlService( DB_SPARQL_ENDPOINT, query );
    	ResultSet results = qExe.execSelect();
    	while(results.hasNext()){
    		Binding binding = results.nextBinding();
    		Iterator<Var> vars = binding.vars();
    		String predicate = "";
    		String object = "";
    		String label = "";
    		String type = "";
    		while(vars.hasNext()){
    			Var var = vars.next();
    			Node node = binding.get(var);
    			String name = var.getVarName();
    			String value;
    			if(node.isURI())
    				value = node.getURI();
    			else
    				value = node.getLiteralValue().toString();
    			if(name.equals("predicate"))
    				predicate = value;
    			else if(name.equals("object"))
    				object = value;
    			else if(name.equals("label"))
    				label = value;
    			else if(name.equals("type"))
    				type = value;
    		}
    		if(!predicate.equals("")){
    			LinkedDataNode objectNode = new LinkedDataNode(object, label, type, repoConnection);
				LinkedDataTriple newTriple = new LinkedDataTriple(this, objectNode, predicate, CurrentNode.subject, repoConnection);
				samples.add(new Sample(newTriple));
    		}
    	}		
		
		
		
		
		
		//+ "GRAPH ?g { "
		String queryStr = "SELECT ?image ?predicate ?object ?label ?type WHERE {"				
    			+"{  SELECT ?predicate ?object WHERE { <"+ uri +"> ?predicate ?object } }"
    			+ "?object <http://www.w3.org/2000/01/rdf-schema#label> ?label. "
                + "OPTIONAL { ?object <http://dbpedia.org/ontology/thumbnail> ?image. "
    			+ "?object <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type. "
    			+ "FILTER(?type=  <http://dbpedia.org/ontology/Person> "
    			+ "|| ?type=  <http://dbpedia.org/ontology/Place> "
    			+ "|| ?type=  <http://dbpedia.org/ontology/Organisation> "
    			+ "|| ?type = <http://dbpedia.org/ontology/Work>)"
    			+ "}} LIMIT 500";
		System.out.println("\t Using SPARQL EndPoint: " + LOCAL_SPARQL_ENDPOINT);
		System.out.println("\t RUN SPARQL: " + queryStr);
    	query = QueryFactory.create(queryStr);
    	qExe = QueryExecutionFactory.sparqlService( LOCAL_SPARQL_ENDPOINT, query );
    	results = qExe.execSelect();
    	//ResultSetFormatter.out(System.out, results, query) ;
    	while(results.hasNext()){
    		Binding binding = results.nextBinding();
    		Iterator<Var> vars = binding.vars();
    		String predicate = "";
    		String object = "";
    		String label = "";
    		String type = "";
            String image = "";
    		while(vars.hasNext()){
    			Var var = vars.next();
    			Node node = binding.get(var);
    			String name = var.getVarName();
    			String value;
    			if(node.isURI())
    				value = node.getURI();
    			else
    				value = node.getLiteralValue().toString();
    			if(name.equals("predicate"))
    				predicate = value;
    			else if(name.equals("object"))
    				object = value;
    			else if(name.equals("label"))
    				label = value;
    			else if(name.equals("type"))
    				type = value;
                else if(name.equals("image"))
                    image = value;
    		}
    		if(!predicate.equals("")){
    			LinkedDataNode objectNode = new LinkedDataNode(object, label, type, repoConnection, image);
				LinkedDataTriple newTriple = new LinkedDataTriple(this, objectNode, predicate, CurrentNode.subject, repoConnection);
				samples.add(new Sample(newTriple));
    		}
    	}
	
	}
	
	public void retrieveSubjectExtensions(List<Sample> samples, boolean remote) throws RepositoryException, MalformedQueryException, QueryEvaluationException{

		String queryString = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
			    + "PREFIX owl: <http://www.w3.org/2002/07/owl#> "
				+ "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
				+ "SELECT DISTINCT ?predicate ?subject ?label ?type WHERE{ "
                + "?subject ?predicate <"+ uri + "> ."
                + "?predicate rdf:type owl:ObjectProperty ."
                + "?subject a owl:Thing ."
                + "?subject rdfs:label ?label ."
                + "?subject a ?type."
                + "FILTER(?type = <http://dbpedia.org/ontology/Person> || "
                + "?type = <http://dbpedia.org/ontology/Place> || "
                + "?type = <http://dbpedia.org/ontology/Organisation> || "
                + "?type = <http://dbpedia.org/ontology/Work> || "
                + "?type = <http://dbpedia.org/ontology/Event>)."
                + "FILTER(langMatches(lang(?label), \"EN\")). "
                + "} LIMIT 500";
//		System.out.println(queryString);
//		TupleQuery query = repoConnection.prepareTupleQuery(QueryLanguage.SPARQL, queryString);
//		TupleQueryResult result = query.evaluate();
//
//		while(result.hasNext()){
//			BindingSet bindingSet = result.next();
//			Literal subjectLiteral = (Literal)bindingSet.getValue("label");
//			String language = subjectLiteral.getLanguage();
//			if(language != null){
//				if(subjectLiteral.getLanguage().equals("en")){
//					LinkedDataNode subjectNode = new LinkedDataNode(bindingSet.getValue("subject").stringValue(), subjectLiteral.getLabel(), bindingSet.getValue("type").stringValue(), repoConnection);
//					LinkedDataTriple newConnection = new LinkedDataTriple(subjectNode, this, bindingSet.getValue("predicate").stringValue(), CurrentNode.object, repoConnection);
//					samples.add(new Sample(newConnection));
//				}
//			}
//		}
		System.out.println("\t Using SPARQL EndPoint: " + DB_SPARQL_ENDPOINT);
		System.out.println("\t RUN SPARQL: " + queryString);
    	Query query = QueryFactory.create(queryString);
    	QueryExecution qExe = QueryExecutionFactory.sparqlService( DB_SPARQL_ENDPOINT, query );
    	ResultSet results = qExe.execSelect();
    	//ResultSetFormatter.out(System.out, results, query) ;
    	while(results.hasNext()){
    		Binding binding = results.nextBinding();
    		Iterator<Var> vars = binding.vars();
    		String predicate = "";
    		String subject = "";
    		String label = "";
    		String type = "";
    		while(vars.hasNext()){
    			Var var = vars.next();
    			Node node = binding.get(var);
    			String name = var.getVarName();
    			String value;
    			if(node.isURI())
    				value = node.getURI();
    			else
    				value = node.getLiteralValue().toString();
    			if(name.equals("predicate"))
    				predicate = value;
    			else if(name.equals("subject"))
    				subject = value;
    			else if(name.equals("label"))
    				label = value;
    			else if(name.equals("type"))
    				type = value;
    		}
    		if(!predicate.equals("")){
    			LinkedDataNode subjectNode = new LinkedDataNode(subject, label, type, repoConnection);
				LinkedDataTriple newTriple = new LinkedDataTriple(subjectNode, this, predicate, CurrentNode.object, repoConnection);
				samples.add(new Sample(newTriple));
    		}
    	}
		
		
		
    	//+ "GRAPH ?g { "
		String queryStr = "SELECT ?image ?subject ?predicate ?label ?type WHERE {"				
    			+"{  SELECT ?subject ?predicate WHERE { ?subject ?predicate <"+ uri +"> } }"
    			+ "?subject <http://www.w3.org/2000/01/rdf-schema#label> ?label. "
                + "OPTIONAL { ?subject <http://dbpedia.org/ontology/thumbnail> ?image. "
    			+ "?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type. "
    			+ "FILTER(?type=  <http://dbpedia.org/ontology/Person> "
    			+ "|| ?type=  <http://dbpedia.org/ontology/Place> "
    			+ "|| ?type=  <http://dbpedia.org/ontology/Organisation> "
    			+ "|| ?type = <http://dbpedia.org/ontology/Work>)"
    			+ "}} LIMIT 500";
		System.out.println("\t Using SPARQL EndPoint: " + LOCAL_SPARQL_ENDPOINT);
		System.out.println("\t RUN SPARQL: " + queryStr);
    	query = QueryFactory.create(queryStr);
    	qExe = QueryExecutionFactory.sparqlService( LOCAL_SPARQL_ENDPOINT, query );
    	results = qExe.execSelect();

    	while(results.hasNext()){
    		Binding binding = results.nextBinding();
    		Iterator<Var> vars = binding.vars();
    		String predicate = "";
    		String subject = "";
    		String label = "";
    		String type = "";
            String image = "";
    		while(vars.hasNext()){
    			Var var = vars.next();
    			Node node = binding.get(var);
    			String name = var.getVarName();
    			String value;
    			if(node.isURI())
    				value = node.getURI();
    			else
    				value = node.getLiteralValue().toString();
    			if(name.equals("predicate"))
    				predicate = value;
    			else if(name.equals("subject"))
    				subject = value;
    			else if(name.equals("label"))
    				label = value;
    			else if(name.equals("type"))
    				type = value;
                else if(name.equals("image"))
                    image = value;
    		}
    		if(!predicate.equals("")){
    			LinkedDataNode subjectNode = new LinkedDataNode(subject, label, type, repoConnection, image);
				LinkedDataTriple newTriple = new LinkedDataTriple(subjectNode, this, predicate, CurrentNode.object, repoConnection);
				samples.add(new Sample(newTriple));
    		}
    	}	

		
	}
	//Doesn't work...Java and Tomcat don't play nice together with their encodings?
	public String retrieveNameFromURI(String uri){
		String temp= uri;
		try {
			temp = URLDecoder.decode(temp, "UTF-8");
			int index=0;
			for(int i = 0; i < temp.length(); i++){
				if(temp.charAt(i) == '/')
					index = i;
			}
			temp = temp.substring(index + 1, temp.length());
			temp = temp.replace("_", " ");
			System.out.println(temp);
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return temp;
	}
	public void setName(String name){
		this.name = name;
	}
	public String getName(){
		return name;
	}
	public String getURI(){
		return uri;
	}
    public String getImage(){
        return image;
    }
	public String getTypeURI(){
		return this.typeURI;
	}
	
	public RepositoryConnection getRepoConnection(){
		return this.repoConnection;
	}
}
