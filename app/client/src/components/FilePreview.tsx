import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { FileDownload as FileDownloadIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface FilePreviewProps {
  reviewId: string;
  filename: string;
  downloadFile: () => Promise<Blob>;
}

const FilePreview: React.FC<FilePreviewProps> = ({ reviewId, filename, downloadFile }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (extension === 'txt') {
      return 'text';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'word';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else {
      return 'unknown';
    }
  };

  useEffect(() => {
    const loadFilePreview = async () => {
      if (!filename) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const type = getFileType(filename);
        setFileType(type);
        
        // Only load preview for supported file types
        if (['image', 'pdf', 'text'].includes(type)) {
          const blob = await downloadFile();
          
          if (type === 'text') {
            // For text files, read the content
            const text = await blob.text();
            setFileContent(text);
          } else {
            // For images and PDFs, create an object URL
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          }
        }
      } catch (err) {
        console.error('Error loading file preview:', err);
        setError('Failed to load file preview');
      } finally {
        setLoading(false);
      }
    };

    loadFilePreview();
    
    // Cleanup
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [filename, downloadFile]);

  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <img 
              src={previewUrl || ''} 
              alt={filename} 
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
            />
          </Box>
        );
      
      case 'pdf':
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(previewUrl || '', '_blank')}
                sx={{ mr: 1 }}
              >
                Open PDF
              </Button>
            </Box>
            
            <Box sx={{ height: '500px', border: '1px solid #ccc' }}>
              <iframe 
                src={previewUrl || ''} 
                title={filename}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          </Box>
        );
      
      case 'text':
        return (
          <Box sx={{ p: 2 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: '400px', 
                overflow: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f5f5f5'
              }}
            >
              {fileContent || 'No content to display'}
            </Paper>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Preview not available for this file type
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Please download the file to view its contents
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Paper variant="outlined" sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.1)' 
      }}>
        <Typography variant="subtitle1">
          {filename}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={() => downloadFile().then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          })}
        >
          Download
        </Button>
      </Box>
      
      {renderPreview()}
    </Paper>
  );
};

export default FilePreview; 