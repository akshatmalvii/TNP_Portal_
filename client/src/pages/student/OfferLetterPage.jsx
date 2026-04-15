import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Upload, Loader2, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/Dialog';

export default function OfferLetterPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const token = localStorage.getItem('token');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/v1/students/offers/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch offers');
      }
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleFileUpload = async (offer, file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 for simplicity in this demo (In production, use S3/Cloudinary)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result;

        const res = await fetch('http://localhost:5000/api/v1/students/offers/upload-letter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            offer_id: offer.offer_id,
            application_id: offer.application_id,
            offer_letter_url: base64Content // This is our "URL" for now
          })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Upload failed');
        }
        
        setShowSuccessDialog(true);
        fetchOffers();
      };
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">No Placements Found</h2>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              You haven't been placed in any company yet. Once you accept an offer, you'll be able to upload your offer letter here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Letter Management</h1>
          <p className="text-gray-500 mt-1">Submit your official offer letters for verification.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {offers.map((offer) => (
          <Card key={offer.offer_id || offer.application_id} className="overflow-hidden border-indigo-100 shadow-sm">
            <div className={`h-1 ${offer.offer_letter_url ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <CardHeader className="bg-white border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-indigo-900">
                    {offer.company_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{offer.position}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  offer.offer_letter_url ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {offer.offer_letter_url ? (
                    <><CheckCircle className="h-3 w-3" /> Submitted</>
                  ) : (
                    <><Clock className="h-3 w-3" /> Pending Submission</>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Submission Info</p>
                  {offer.offer_letter_url ? (
                    <p className="text-sm text-gray-700">
                      Last uploaded: <span className="font-semibold">{new Date(offer.offer_letter_timestamp).toLocaleString()}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 font-medium italic">
                      Please upload your received offer letter PDF.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {offer.offer_letter_url && (
                    <Button 
                      variant="outline" 
                      className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => {
                        const win = window.open();
                        win.document.write(`<iframe src="${offer.offer_letter_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" /> View Submitted
                    </Button>
                  )}
                  
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${offer.offer_id || offer.application_id}`}
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(offer, e.target.files[0])}
                    />
                    <Button 
                      onClick={() => document.getElementById(`file-${offer.offer_id || offer.application_id}`).click()}
                      disabled={uploading}
                      className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {offer.offer_letter_url ? 'Update Document' : 'Upload Offer Letter'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Success
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">Offer letter has been uploaded successfully!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
