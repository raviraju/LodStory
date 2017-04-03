package edu.isi.serverbackend.feature;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;

import edu.isi.serverbackend.feature.util.Sample;
import edu.isi.serverbackend.linkedData.LinkedDataTriple;

public class EitherNotPlaceFeature {
	public static int isEitherNotPlace(LinkedDataTriple link){
		int eitherIsNotPlace = 1;
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
				+"<"+currentURI+"> a dbpedia-owl:Place. "
				+"<"+extensionURI+"> a dbpedia-owl:Place. "
				+"}";
		
		try {
			BooleanQuery query = link.getRepoConnection().prepareBooleanQuery(QueryLanguage.SPARQL, stringQuery);
			boolean result = query.evaluate();
			if(result == true){
				eitherIsNotPlace = 0;
			}
			else{
				eitherIsNotPlace = 1;
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
		return eitherIsNotPlace;
	}
	
	public static void isEitherNotPlace(List<Sample> samples){
		HashSet<String> eitherNotPlaceSet = new HashSet<String>();
		String currentURI;
		if(!samples.isEmpty()){
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String stringQuery = "SELECT ?s WHERE {"
					+ "?s a dbpedia-owl:Place. ";
			String filterQuery = "FILTER(";
			if(samples.get(0).getLink().isSubjectConnection()){
				filterQuery += "?s = <" + samples.get(0).getLink().getSubject().getURI() + "> OR ";
				currentURI = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				filterQuery += "?s = <" + samples.get(0).getLink().getObject().getURI() + "> OR ";
				currentURI = samples.get(0).getLink().getObject().getURI();
			}
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					filterQuery += "?s = <" + samples.get(i).getLink().getObject().getURI() + ">";
				}
				else{
					filterQuery += "?s = <" + samples.get(i).getLink().getSubject().getURI() + ">";
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
					eitherNotPlaceSet.add(bindingSet.getValue("s").stringValue());
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
			if(eitherNotPlaceSet.contains(currentURI)){
				for(Sample sample:samples){
					if(sample.getLink().isSubjectConnection()){
						if(eitherNotPlaceSet.contains(sample.getLink().getObject().getURI())){
							sample.setEitherNotPlace(0);
						}
						else{
							sample.setEitherNotPlace(1);
						}
					}
					else{
						if(eitherNotPlaceSet.contains(sample.getLink().getSubject().getURI())){
							sample.setEitherNotPlace(0);
						}
						else{
							sample.setEitherNotPlace(1);
						}
					}
				}
			}
			else{
				for(Sample sample:samples){
					sample.setEitherNotPlace(1);
				}
			}
		}
	}
}
