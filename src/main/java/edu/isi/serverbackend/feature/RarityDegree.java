package edu.isi.serverbackend.feature;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.*;

import edu.isi.serverbackend.feature.util.Sample;

public class RarityDegree {
	static HashMap<String, Double> subjectTypeNormalizeMap;
	static HashMap<String, Double> objectTypeNormalizeMap;
	
	/**
	 * static block to initialize static member data
	 */
	static{
		subjectTypeNormalizeMap =  new HashMap<String,Double>();
		subjectTypeNormalizeMap.put("http://dbpedia.org/ontology/Person", 3997863.0);
		subjectTypeNormalizeMap.put("http://dbpedia.org/ontology/Place", 1968846.0);
		subjectTypeNormalizeMap.put("http://dbpedia.org/ontology/Organisation", 957433.0);
		subjectTypeNormalizeMap.put("http://dbpedia.org/ontology/Work", 2350125.0);
		subjectTypeNormalizeMap.put("http://dbpedia.org/ontology/Event", 151056.0);
		
		objectTypeNormalizeMap =  new HashMap<String,Double>();
		objectTypeNormalizeMap.put("http://dbpedia.org/ontology/Person", 1783523.0);
		objectTypeNormalizeMap.put("http://dbpedia.org/ontology/Place", 3788280.0);
		objectTypeNormalizeMap.put("http://dbpedia.org/ontology/Organisation", 2680701.0);
		objectTypeNormalizeMap.put("http://dbpedia.org/ontology/Work", 383548.0);
		objectTypeNormalizeMap.put("http://dbpedia.org/ontology/Event", 116799.0);
	}
	
	public static void calculateExtensionRarity(List<Sample> samples){
		if(!samples.isEmpty()){
			HashMap<String, Double> objectExtensionMap = new HashMap<String, Double>();
			HashMap<String, Double> subjectExtensionMap = new HashMap<String, Double>();
			HashMap<String, Double> normalizeMap = new HashMap<String, Double>();
			HashMap<String, Double> subjectPredicateMap = new HashMap<String, Double>();
			HashMap<String, Double> objectPredicateMap = new HashMap<String, Double>();
			for(int i = 0; i < samples.size(); i++){
				if(samples.get(i).getLink().isSubjectConnection()){
					String key = samples.get(i).getLink().getPredicate() + " " + samples.get(i).getLink().getObject().getURI();
					objectExtensionMap.put(key, 0.0);
				}
				else{
					String key = samples.get(i).getLink().getPredicate() + " " + samples.get(i).getLink().getSubject().getURI();
					subjectExtensionMap.put(key, 0.0);
				}
				normalizeMap.put(samples.get(i).getLink().getPredicate(), 0.0);
				subjectPredicateMap.put(samples.get(i).getLink().getPredicate(), 0.0);
				objectPredicateMap.put(samples.get(i).getLink().getPredicate(), 0.0);
			}
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String currentURI = null;
			if(samples.get(0).getLink().isSubjectConnection()){
				currentURI = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				currentURI = samples.get(0).getLink().getObject().getURI();
			}
			StringBuffer stringQuery = new StringBuffer("SELECT ?p (COUNT(*) AS ?count) WHERE{ ?s ?p ?o. ");
			StringBuffer filterQuery = new StringBuffer("FILTER(");
			int total = normalizeMap.keySet().size();
			int count = 0;
			for(String predicate:normalizeMap.keySet()){
				filterQuery.append( "?p = <" + predicate + ">");
				count++;
				if(count < total){
					filterQuery.append(" OR ");
				}
			}
			filterQuery.append ("). ");
			stringQuery.append(filterQuery);
			stringQuery.append("}");
			System.out.println(stringQuery.toString());
			System.out.println(filterQuery.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("p").stringValue();
					normalizeMap.put(key, Double.parseDouble(bindingSet.getValue("count").stringValue()));
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
			stringQuery = new StringBuffer("SELECT ?p (COUNT(?o) AS ?num) WHERE{ ");
			stringQuery.append("<" + currentURI + "> ?p ?o. ");
			stringQuery.append(filterQuery);
			stringQuery.append("}");
			System.out.println(stringQuery.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("p").stringValue();
					subjectPredicateMap.put(key, Double.parseDouble(bindingSet.getValue("num").stringValue()));
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
			
			stringQuery = new StringBuffer("SELECT ?p (COUNT(?s) AS ?num) WHERE{ ");
			stringQuery.append("?s ?p <" + currentURI + ">. ");
			stringQuery.append(filterQuery);
			stringQuery.append("}");
			System.out.println(stringQuery.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("p").stringValue();
					objectPredicateMap.put(key, Double.parseDouble(bindingSet.getValue("num").stringValue()));
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
			
			stringQuery = new StringBuffer("SELECT ?p ?o (COUNT(?s) AS ?num) WHERE{ ");
			stringQuery.append("<" + currentURI + "> ?p ?o. ");
			stringQuery.append("?s ?p ?o.");
			stringQuery.append(filterQuery);
			stringQuery.append("}");
			System.out.println(stringQuery.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("p").stringValue() + " " + bindingSet.getValue("o").stringValue();
					objectExtensionMap.put(key, Double.parseDouble(bindingSet.getValue("num").stringValue()));
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
			
			stringQuery = new StringBuffer("SELECT ?p ?s (COUNT(?o) AS ?num) WHERE{ ");
			stringQuery.append("?s ?p <" + currentURI + ">. ");
			stringQuery.append("?s ?p ?o. ");
			stringQuery.append(filterQuery);
			stringQuery.append("}");
			System.out.println(stringQuery.toString());
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String key = bindingSet.getValue("p").stringValue() + " " + bindingSet.getValue("s").stringValue();
					subjectExtensionMap.put(key, Double.parseDouble(bindingSet.getValue("num").stringValue()));
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
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					String predicate = sample.getLink().getPredicate();
					String object = sample.getLink().getObject().getURI();
					sample.setObjectExtensionRarity(objectExtensionMap.get(predicate + " " + object) / normalizeMap.get(predicate));
					sample.setSubjectExtensionRarity(subjectPredicateMap.get(predicate) / normalizeMap.get(predicate));
				}
				else{
					String predicate = sample.getLink().getPredicate();
					String subject = sample.getLink().getSubject().getURI();
					sample.setSubjectExtensionRarity(subjectExtensionMap.get(predicate + " " +subject) / normalizeMap.get(predicate));
					sample.setObjectExtensionRarity(objectPredicateMap.get(predicate) / normalizeMap.get(predicate));
				}
			}
		}
	}
	
	
	public static void calcuateNodeDegree(List<Sample> samples){
		if(!samples.isEmpty()){
			HashMap<String, Double> subjectExtensionDegreeMap = new HashMap<String, Double>();
			HashMap<String, Double> objectExtensionDegreeMap = new HashMap<String, Double>();
			String currentURI = null;
			String currentType = null;
			StringBuffer stringQuery;
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String typeFilterQuery = "FILTER(?type = <http://dbpedia.org/ontology/Person> "
					+ "OR ?type = <http://dbpedia.org/ontology/Place> "
					+ "OR ?type = <http://dbpedia.org/ontology/Organisation> "
					+ "OR ?type = <http://dbpedia.org/ontology/Work> "
					+ "OR ?type =<http://dbpedia.org/ontology/Event>).";
			if(samples.get(0).getLink().isSubjectConnection()){
				currentURI = samples.get(0).getLink().getSubject().getURI();
				currentType = samples.get(0).getLink().getSubject().getTypeURI();
			}
			else{
				currentURI = samples.get(0).getLink().getObject().getURI();
				currentType = samples.get(0).getLink().getObject().getTypeURI();
			}
			
			if(currentType == null){
				stringQuery = new StringBuffer("SELECT ?type WHERE{");
				stringQuery.append("<" + currentURI + "> a ?type. ");
				stringQuery.append(typeFilterQuery);
				try {
					TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
					TupleQueryResult result = query.evaluate();
					while(result.hasNext()){
						BindingSet bindingSet = result.next();
						currentType = bindingSet.getValue("type").stringValue();
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
			}
			int objectExtensionNum = 0;
			stringQuery = new StringBuffer("SELECT ?y (COUNT(?s) AS ?num) WHERE{ ");
			stringQuery.append("<"+currentURI + "> ?p ?y. ");
			stringQuery.append("?s ?q ?y. ");
			stringQuery.append("?y rdfs:label ?label.");
			stringQuery.append("?y a owl:Thing. ");
			stringQuery.append("?q a owl:ObjectProperty. ");
			stringQuery.append("?p a owl:ObjectProperty. ");
			stringQuery.append("}GROUP BY ?y ");
			
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					objectExtensionDegreeMap.put(bindingSet.getValue("y").stringValue(), Double.parseDouble(bindingSet.getValue("num").stringValue()));
					objectExtensionNum++;
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
			
			int subjectExtensionNum = 0;
			stringQuery = new StringBuffer("SELECT ?y (COUNT(?o) AS ?num) WHERE{ ");
			stringQuery.append("?y ?p <"+currentURI + ">.");
			stringQuery.append("?y ?q ?o. ");
			stringQuery.append("?y rdfs:label ?label.");
			stringQuery.append("?y a owl:Thing. ");
			stringQuery.append("?q a owl:ObjectProperty. ");
			stringQuery.append("?p a owl:ObjectProperty. ");
			stringQuery.append("}GROUP BY ?y ");
			
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, stringQuery.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					subjectExtensionDegreeMap.put(bindingSet.getValue("y").stringValue(), Double.parseDouble(bindingSet.getValue("num").stringValue()));
					subjectExtensionNum++;
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
			
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					sample.setSubjectRarity(objectExtensionNum / subjectTypeNormalizeMap.get(currentType));
					sample.setObjectRarity(objectExtensionDegreeMap.get(sample.getLink().getObject().getURI()) / objectTypeNormalizeMap.get(sample.getLink().getObject().getTypeURI()));
				}
				else{
					sample.setObjectRarity(subjectExtensionNum / objectTypeNormalizeMap.get(currentType));
					sample.setSubjectRarity(subjectExtensionDegreeMap.get(sample.getLink().getSubject().getURI()) / subjectTypeNormalizeMap.get(sample.getLink().getSubject().getTypeURI()));
				}
			}
		}
	}
	
}