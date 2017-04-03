package edu.isi.serverbackend.feature;

import java.util.*;

import edu.isi.serverbackend.linkedData.LinkedDataTriple;
import edu.isi.serverbackend.feature.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;

public class DifferentOccupationFeature {
	public static float isDifferentOccupation(LinkedDataTriple link){
		float differentOccupation = 0;
		String currentURI;
		String extensionURI;
		if(link.isSubjectConnection()){
			currentURI = link.getSubject().getURI();
			extensionURI = link.getObject().getURI();
		}
		else{
			currentURI = link.getObject().getURI();
			extensionURI = link.getSubject().getURI();
		}
		String stringQuery = "ASK { "
				+"<"+currentURI+"> a ?type. "
				+"?type rdfs:subClassOf dbpedia-owl:Person. "
				+"<"+extensionURI+"> a ?type. "
				+"}";
		try {
			BooleanQuery query = link.getRepoConnection().prepareBooleanQuery(QueryLanguage.SPARQL, stringQuery);
			boolean result = query.evaluate();
			if(result == true){
				differentOccupation = 0;
			}
			else{
				differentOccupation = 1;
			}
		} catch (RepositoryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedQueryException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (QueryEvaluationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return differentOccupation;
	}
	
	public static void isDifferentOccupation(List<Sample> samples){
		if(!samples.isEmpty()){
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			HashSet<String> diffOccupationSet = new HashSet<String>();
			String currentNode;
			if(samples.get(0).getLink().isSubjectConnection()){
				currentNode = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				currentNode = samples.get(0).getLink().getObject().getURI();
			}
			String stringQuery = "SELECT ?s2 WHERE{ "
					+ "<"+ currentNode + "> a ?type. " 
					+ "?s2 a ?type. "
					+ "?type rdfs:subClassOf dbpedia-owl:Person. ";
			String filterQuery = "FILTER(";
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					filterQuery += "?s2 = <" + samples.get(i).getLink().getObject().getURI() + ">";
				}
				else{
					filterQuery += "?s2 = <" + samples.get(i).getLink().getSubject().getURI() + ">";
				}
				if(i < samples.size() - 1){
					filterQuery += " OR ";
				}
			}
			filterQuery += "). }";
			stringQuery += filterQuery;
			System.out.println(stringQuery);
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery);
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					diffOccupationSet.add(bindingSet.getValue("s2").stringValue());
				}
			} catch (RepositoryException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (MalformedQueryException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (QueryEvaluationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					if(diffOccupationSet.contains(samples.get(i).getLink().getObject().getURI())){
						samples.get(i).setDifferentOccupation(0);
					}
					else{
						samples.get(i).setDifferentOccupation(1);
					}
				}
				else{
					if(diffOccupationSet.contains(samples.get(i).getLink().getSubject().getURI())){
						samples.get(i).setDifferentOccupation(0);
					}
					else{
						samples.get(i).setDifferentOccupation(1);
					}
				}
			}
		}
	}
	
}
