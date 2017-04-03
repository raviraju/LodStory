package edu.isi.serverbackend.localDatabase.bean;

public class PredicateBean {
	private String predicateID;
	private String uri;
	private String name;
	public String getPredicateID() {
		return predicateID;
	}
	public void setPredicateID(String id){
		this.predicateID = id;
	}
	public void setURI(String uri){
		this.uri = uri;
		this.name = obtainPredicateName(uri);
	}
	public String getURI() {
		return uri;
	}
	public String getName() {
		return name;
	}
	public static String obtainPredicateName(String predicate){
		String[] temp = predicate.split("//");
		String[] temp2 = temp[1].split("/");
		return temp2[temp2.length-1];
	}
}
