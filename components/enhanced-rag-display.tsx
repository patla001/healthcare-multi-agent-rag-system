"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Database, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  Info,
  Star
} from "lucide-react";

interface RAGDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  relevancy: number;
  similarity: number;
  computed_relevancy?: number;
}

interface RAGContext {
  documents_used: number;
  openai_enhanced: boolean;
  rag_documents: RAGDocument[];
}

interface EnhancedRAGDisplayProps {
  ragContext?: RAGContext;
  dataSources: string[];
  showDetails?: boolean;
}

export default function EnhancedRAGDisplay({ 
  ragContext, 
  dataSources, 
  showDetails = false 
}: EnhancedRAGDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  if (!ragContext || ragContext.documents_used === 0) {
    return null;
  }

  const { documents_used, openai_enhanced, rag_documents } = ragContext;

  const getRelevancyColor = (relevancy: number) => {
    if (relevancy >= 0.9) return "bg-green-500";
    if (relevancy >= 0.8) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSourceIcon = (source: string) => {
    if (source.includes("OpenAI")) return <Brain className="w-4 h-4" />;
    if (source.includes("RAG") || source.includes("Knowledge")) return <Database className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Enhanced Sources Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm text-blue-800">
                RAG-Enhanced Response
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {openai_enhanced && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {documents_used} Sources
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Data Sources Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {dataSources.map((source, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 p-2 bg-white rounded-lg border"
              >
                {getSourceIcon(source)}
                <span className="text-xs font-medium text-gray-700">
                  {source}
                </span>
                <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
              </div>
            ))}
          </div>

          {/* Quality Indicators */}
          <div className="flex items-center justify-between text-xs text-blue-700">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Evidence-Based</span>
              </span>
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Knowledge Retrieval</span>
              </span>
              {openai_enhanced && (
                <span className="flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Reasoning</span>
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 h-6 px-2"
            >
              <span className="text-xs mr-1">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Document Details */}
      {isExpanded && rag_documents && rag_documents.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Knowledge Base Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rag_documents.map((doc, index) => (
              <div key={doc.id} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocument === doc.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDocument(
                    selectedDocument === doc.id ? null : doc.id
                  )}
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {doc.source}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      {/* Relevancy Score */}
                      <div className="flex items-center space-x-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getRelevancyColor(
                            doc.computed_relevancy || doc.relevancy
                          )}`}
                        />
                        <span className="text-xs text-gray-600">
                          {((doc.computed_relevancy || doc.relevancy) * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Expand/Collapse */}
                      {selectedDocument === doc.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Document Content (when expanded) */}
                  {selectedDocument === doc.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 leading-relaxed">
                        {doc.content}
                      </div>
                      
                      {/* Similarity Score */}
                      {doc.similarity && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          <span>
                            Similarity Score: {(doc.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {index < rag_documents.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
            
            {/* Summary Footer */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Retrieved {rag_documents.length} relevant documents from knowledge base
                </span>
                <span className="flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>Healthcare Knowledge Base</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 