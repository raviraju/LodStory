package edu.isi.serverbackend.feature;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;

import edu.isi.serverbackend.feature.util.Sample;
import edu.isi.serverbackend.linkedData.LinkedDataTriple;

public class RarityFeature {
	
	public static double calculatePredicateRarity(LinkedDataTriple link){
		double rarity = 0;
		String stringQuery = "SELECT (COUNT(*) AS ?count) WHERE{ "
				+ "?s <"+link.getPredicate()+"> ?o. "
				+"}";
		try {
			TupleQuery query = link.getRepoConnection().prepareTupleQuery(QueryLanguage.SPARQL, stringQuery);
			TupleQueryResult result = query.evaluate();
			rarity = 1/Math.log(Double.parseDouble(result.next().getValue("count").stringValue()));
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
		return rarity;
	}
	
	public static void calculatePredicateRarity(List<Sample> samples){
		HashMap<String, Double> rarityMap = new HashMap<String, Double>();
		for(int i = 0; i < samples.size(); i++){
			if(!rarityMap.containsKey(samples.get(i).getLink().getPredicate())){
				rarityMap.put(samples.get(i).getLink().getPredicate(), 0.0);
			}
		}
		//String[] stringPredicates = (String[]) rarityMap.keySet().toArray();
		if(!samples.isEmpty()){
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String stringQuery = "SELECT ?p (COUNT(*) AS ?count) WHERE{ "
					 + "?s ?p ?o. ";
			String filterQuery = "FILTER(";
			int total = rarityMap.keySet().size();
			int count = 0;
			for(String predicate:rarityMap.keySet()){
				filterQuery += "?p = <" + predicate + ">";
				count++;
				if(count < total){
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
					String key = bindingSet.getValue("p").stringValue();
					rarityMap.put(key, 1/Math.log(Double.parseDouble(bindingSet.getValue("count").stringValue())));
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
				samples.get(i).setRarity(rarityMap.get(samples.get(i).getLink().getPredicate()));
			}
		}
		
	}
}
