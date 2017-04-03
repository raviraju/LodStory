package edu.isi.serverbackend.feature;

import edu.isi.serverbackend.feature.util.Sample;
import edu.isi.serverbackend.linkedData.LinkedDataTriple;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.*;

public class SmallPlaceFeature {
	public static float calculateSmallPlace(LinkedDataTriple link){
		float smallParam = 0;
		String evaluateURI;
		
		if(link.isSubjectConnection()){
			evaluateURI = link.getObject().getURI();
		}
		else{
			evaluateURI = link.getSubject().getURI();
		}
		
		String stringQuery = "SELECT ?num WHERE{ "
				+"<"+evaluateURI+"> dbpedia-owl:areaTotal ?num. "
				+"}";
		
		try {
			TupleQuery query = link.getRepoConnection().prepareTupleQuery(QueryLanguage.SPARQL, stringQuery);
			TupleQueryResult result = query.evaluate();
			if(result == null){
				smallParam = 0;
			}
			else{
				smallParam = (float)1/Float.parseFloat(result.next().getValue("num").stringValue());
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
		return smallParam;
	}
	
	public static void calculateSmallPlace(List<Sample> samples){
		HashMap<String, Double> areaMap =  new HashMap<String, Double>();
		
		if(!samples.isEmpty()){
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			
			if(samples.get(0).getLink().isSubjectConnection()){
				areaMap.put(samples.get(0).getLink().getSubject().getURI(), 0.0);
			}
			else{
				areaMap.put(samples.get(0).getLink().getObject().getURI(), 0.0);
			}
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					areaMap.put(sample.getLink().getObject().getURI(), 0.0);
				}
				else{
					areaMap.put(sample.getLink().getSubject().getURI(), 0.0);
				}
			}
			StringBuffer queryBuffer = new StringBuffer();
			queryBuffer.append("SELECT ?s ?area WHERE{ ");
			queryBuffer.append("?s dbpedia-owl:areaTotal ?area. ");
			StringBuffer filterQueryBuffer = new StringBuffer("FILTER(");
			int count = 0;
			for(String key:areaMap.keySet()){
				filterQueryBuffer.append("?s = <"+key+">");
				count++;
				if(count < areaMap.keySet().size()){
					filterQueryBuffer.append(" OR ");
				}
			}
			filterQueryBuffer.append(") ");
			queryBuffer.append(filterQueryBuffer);
			queryBuffer.append("} ");
			System.out.println(filterQueryBuffer.toString());
			System.out.println(queryBuffer.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, queryBuffer.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("s").stringValue();
					areaMap.put(key, 1/Math.log(Double.parseDouble(bindingSet.getValue("area").stringValue())));
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
					samples.get(i).setSmallPlace(areaMap.get(samples.get(i).getLink().getObject().getURI()));
				}
				else{
					samples.get(i).setSmallPlace(areaMap.get(samples.get(i).getLink().getSubject().getURI()));
				}
			}
			
		}
	}
}
