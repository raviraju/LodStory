package edu.isi.serverbackend.feature;

import java.util.*;

import org.openrdf.query.*;
import org.openrdf.repository.*;

import edu.isi.serverbackend.feature.util.Sample;

public class ImportanceFeature {
	public static void calculateImportance(List<Sample> samples){
		if(!samples.isEmpty()){
			RepositoryConnection repoConn = samples.get(0).getLink().getRepoConnection();
			String currentUri;
			HashMap<String, Double> importanceMap = new HashMap<String, Double>();
			if(samples.get(0).getLink().isSubjectConnection()){
				currentUri = samples.get(0).getLink().getSubject().getURI();
			}
			else{
				currentUri =  samples.get(0).getLink().getObject().getURI();
			}
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					importanceMap.put(sample.getLink().getObject().getURI(), 0.0);
				}
				else{
					importanceMap.put(sample.getLink().getSubject().getURI(), 0.0);
				}
			}
			StringBuffer subjectQueryBuffer1 = new StringBuffer();
			subjectQueryBuffer1.append("SELECT ?y (COUNT(distinct ?o) AS ?num) WHERE{ ");
			subjectQueryBuffer1.append("<"+currentUri + "> ?p ?y. ");
			subjectQueryBuffer1.append("?y ?q ?o. ");
			subjectQueryBuffer1.append("?y rdfs:label ?label.");
			subjectQueryBuffer1.append("?y a owl:Thing. ");
			subjectQueryBuffer1.append("?q a owl:ObjectProperty. ");
			subjectQueryBuffer1.append("?p a owl:ObjectProperty. ");
			subjectQueryBuffer1.append("}GROUP BY ?y ");
			StringBuffer subjectQueryBuffer2 = new StringBuffer();
			subjectQueryBuffer2.append("SELECT ?y (COUNT(distinct ?s) AS ?num) WHERE{ ");
			subjectQueryBuffer2.append("<"+currentUri + "> ?p ?y. ");
			subjectQueryBuffer2.append("?s ?q ?y. ");
			subjectQueryBuffer2.append("?y rdfs:label ?label.");
			subjectQueryBuffer2.append("?y a owl:Thing. ");
			subjectQueryBuffer2.append("?q a owl:ObjectProperty. ");
			subjectQueryBuffer2.append("?p a owl:ObjectProperty. ");
			subjectQueryBuffer2.append("}GROUP BY ?y ");
			
			StringBuffer objectQueryBuffer1 = new StringBuffer();
			objectQueryBuffer1.append("SELECT ?y (COUNT(distinct ?o) AS ?num) WHERE{ ");
			objectQueryBuffer1.append("?y ?p <"+currentUri + ">.");
			objectQueryBuffer1.append("?y ?q ?o. ");
			objectQueryBuffer1.append("?y rdfs:label ?label.");
			objectQueryBuffer1.append("?y a owl:Thing. ");
			objectQueryBuffer1.append("?q a owl:ObjectProperty. ");
			objectQueryBuffer1.append("?p a owl:ObjectProperty. ");
			objectQueryBuffer1.append("}GROUP BY ?y ");
			StringBuffer objectQueryBuffer2 = new StringBuffer();
			objectQueryBuffer2.append("SELECT ?y (COUNT(distinct ?s) AS ?num) WHERE{ ");
			objectQueryBuffer2.append("?y ?p <"+currentUri + ">.");
			objectQueryBuffer2.append("?s ?q ?y. ");
			objectQueryBuffer2.append("?y rdfs:label ?label.");
			objectQueryBuffer2.append("?y a owl:Thing. ");
			objectQueryBuffer2.append("?q a owl:ObjectProperty. ");
			objectQueryBuffer2.append("?p a owl:ObjectProperty. ");
			objectQueryBuffer2.append("}GROUP BY ?y ");
			
			System.out.println(subjectQueryBuffer1.toString());
			System.out.println(subjectQueryBuffer2.toString());
			System.out.println(objectQueryBuffer1.toString());
			System.out.println(objectQueryBuffer2.toString());
			
			
			try {
				TupleQuery query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, subjectQueryBuffer1.toString());
				TupleQueryResult result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String currentKey = bindingSet.getValue("y").stringValue();
					String currentValue = bindingSet.getValue("num").stringValue();
					if(importanceMap.containsKey(currentKey)){
						importanceMap.put(currentKey, importanceMap.get(currentKey).doubleValue() + Double.parseDouble(currentValue));
					}
					else{
						importanceMap.put(currentKey, Double.parseDouble(currentValue));
					}
					
				}
				
				query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, subjectQueryBuffer2.toString());
				result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String currentKey = bindingSet.getValue("y").stringValue();
					String currentValue = bindingSet.getValue("num").stringValue();
					if(importanceMap.containsKey(currentKey)){
						importanceMap.put(currentKey, importanceMap.get(currentKey).doubleValue() + Double.parseDouble(currentValue));
					}
					else{
						importanceMap.put(currentKey, Double.parseDouble(currentValue));
					}
				}
				query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, objectQueryBuffer1.toString());
				result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String currentKey = bindingSet.getValue("y").stringValue();
					String currentValue = bindingSet.getValue("num").stringValue();
					if(importanceMap.containsKey(currentKey)){
						importanceMap.put(currentKey, importanceMap.get(currentKey).doubleValue() + Double.parseDouble(currentValue));
					}
					else{
						importanceMap.put(currentKey, Double.parseDouble(currentValue));
					}
				}
				query = repoConn.prepareTupleQuery(QueryLanguage.SPARQL, objectQueryBuffer2.toString());
				result = query.evaluate();
				while(result.hasNext()){
					BindingSet bindingSet = result.next();
					String currentKey = bindingSet.getValue("y").stringValue();
					String currentValue = bindingSet.getValue("num").stringValue();
					if(importanceMap.containsKey(currentKey)){
						importanceMap.put(currentKey, importanceMap.get(currentKey).doubleValue() + Double.parseDouble(currentValue));
					}
					else{
						importanceMap.put(currentKey, Double.parseDouble(currentValue));
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
			for(Sample sample:samples){
				if(sample.getLink().isSubjectConnection()){
					sample.setExtensionImportance(importanceMap.get(sample.getLink().getObject().getURI()));
				}
				else{
					sample.setExtensionImportance(importanceMap.get(sample.getLink().getSubject().getURI()));
				}
			}
		}
	}
}
