package edu.isi.serverbackend.linkedData;

import org.openrdf.query.MalformedQueryException;
import org.openrdf.query.QueryEvaluationException;
import org.openrdf.query.QueryLanguage;
import org.openrdf.query.TupleQuery;
import org.openrdf.query.TupleQueryResult;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;

public class LinkedDataTriple {
	private int connectionParam = -1;
	private double interestingness;
	private LinkedDataNode subject;
	private LinkedDataNode object;
	private String predicate;
	public enum CurrentNode{subject, object};
	private CurrentNode currentNode;
	private RepositoryConnection connection;
	
	public LinkedDataTriple(LinkedDataNode subject, LinkedDataNode object, String predicate, CurrentNode node, RepositoryConnection connection){
		this.subject = subject;
		this.object = object;
		this.currentNode = node;
		this.predicate = predicate;
		this.connection = connection;
	}
	
	public void evaluateConnection() throws RepositoryException, MalformedQueryException, QueryEvaluationException{
		String subjectTestQuery = "SELECT (COUNT(DISTINCT ?o ) AS ?count ) WHERE { "
				+ "<" + subject.getURI() + "> " + "<" + predicate + "> " + "?o .}";
		String objectTestQuery = "SELECT (COUNT(DISTINCT ?s ) AS ?count ) WHERE { "
				+ "?s <" + predicate + "> <" + object.getURI() + "> .}";
		if(currentNode == CurrentNode.subject){
			System.out.println(objectTestQuery);
			TupleQuery query = connection.prepareTupleQuery(QueryLanguage.SPARQL, objectTestQuery);
			TupleQueryResult result = query.evaluate();
			this.connectionParam = Integer.parseInt(result.next().getValue("count").stringValue());
			
		}
		else if(currentNode == CurrentNode.object){
			System.out.println(subjectTestQuery);
			TupleQuery query = connection.prepareTupleQuery(QueryLanguage.SPARQL, subjectTestQuery);
			TupleQueryResult result = query.evaluate();
			this.connectionParam = Integer.parseInt(result.next().getValue("count").stringValue());
		}
		
		//int subjectParam = Integer.parseInt(result.next().getValue("count").stringValue());
		
		/**add two number together: how many objects have this relation with A, how many subjects have this relation with B**/
		//this.connectionParam = subjectParam + Integer.parseInt(result.next().getValue("count").stringValue());
	}
	
	public int getTripleParam(){
		return this.connectionParam;
	}
	
	public void setTripleParam(int param){
		this.connectionParam = param;
	}
	
	public LinkedDataNode getSubject(){
		return this.subject;
	}
	
	public LinkedDataNode getObject(){
		return this.object;
	}
	
	public String getPredicate(){
		return this.predicate;
	}
	
	public RepositoryConnection getRepoConnection(){
		return this.connection;
	}
	public boolean isSubjectConnection(){
		if(currentNode == CurrentNode.subject){
			return true;
		}
		else{
			return false;
		}
	}
}
