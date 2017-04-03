package edu.isi.serverbackend.localDatabase.bean;

public class NodeBean {
	private String nodeId;
	private String nodeName;
	private String uri;
	private String typeURI;
	private boolean explored;
	
	public NodeBean(){
		explored = false;
	}
	
	public String getNodeId() {
		return nodeId;
	}
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}
	public String getName() {
		return nodeName;
	}
	public void setName(String nodeName) {
		this.nodeName = nodeName;
	}
	public String getUri() {
		return uri;
	}
	public void setUri(String uri) {
		this.uri = uri;
	}
	public boolean isExplored() {
		return explored;
	}
	public void setExplored(boolean explored) {
		this.explored = explored;
	}

	public String getTypeURI() {
		return typeURI;
	}

	public void setTypeURI(String typeURI) {
		this.typeURI = typeURI;
	}
	
	
}
