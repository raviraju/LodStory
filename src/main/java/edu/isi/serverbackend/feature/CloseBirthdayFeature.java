package edu.isi.serverbackend.feature;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.*;

import edu.isi.serverbackend.feature.util.*;

public class CloseBirthdayFeature {
	public static void calculateCloseBirthDayFeature(List<Sample> samples){
		if(!samples.isEmpty()){
			HashMap<String, Double> birthdayClosenessMap = new HashMap<String, Double>();
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String currentURI;
			if(samples.get(0).getLink().isSubjectConnection()){
				currentURI = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				currentURI = samples.get(0).getLink().getObject().getURI();
			}
			StringBuffer queryBuffer = new StringBuffer();
			queryBuffer.append("SELECT ?s ((year(?date1)-year(?date2)) AS ?diff) WHERE{ ");
			queryBuffer.append("<"+currentURI+"> dbpedia-owl:birthDate ?date1. ");
			queryBuffer.append("?s dbpedia-owl:birthDate ?date2.");
			
			StringBuffer filterQueryBuffer = new StringBuffer();
			filterQueryBuffer.append("FILTER(");
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					filterQueryBuffer.append("?s  = <"+samples.get(i).getLink().getObject().getURI()+">");
					birthdayClosenessMap.put(samples.get(i).getLink().getObject().getURI(), 0.0);
				}
				else{
					filterQueryBuffer.append("?s  = <"+samples.get(i).getLink().getSubject().getURI()+">");
					birthdayClosenessMap.put(samples.get(i).getLink().getSubject().getURI(), 0.0);
				}
				
				if(i < samples.size() - 1){
					filterQueryBuffer.append(" OR ");
				}
			}
			
			filterQueryBuffer.append("). ");
			queryBuffer.append(filterQueryBuffer);
			queryBuffer.append("} ");
			System.out.println(queryBuffer.toString());
			
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, queryBuffer.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("s").stringValue();
					double value = Math.abs(Double.parseDouble(bindingSet.getValue("diff").stringValue()));
					if(value == 0){
						birthdayClosenessMap.put(key, 1.0);
					}
					else{
						birthdayClosenessMap.put(key, 1/value);
					}
					
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
					samples.get(i).setBirthdayCloseness(birthdayClosenessMap.get(samples.get(i).getLink().getObject().getURI()));
				}
				else{
					samples.get(i).setBirthdayCloseness(birthdayClosenessMap.get(samples.get(i).getLink().getSubject().getURI()));
				}
			}
		}
	}
}
