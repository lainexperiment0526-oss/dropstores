import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Share2, Copy, Check, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreQRCodeProps {
  storeUrl: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
}

type TemplateType = 'minimal' | 'elegant' | 'modern' | 'classic';

export function StoreQRCode({ storeUrl, storeName, storeDescription, storeLogo }: StoreQRCodeProps) {
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('minimal');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Store link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `Check out my store: ${storeName}`,
          url: storeUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg' = 'png') => {
    if (!qrRef.current) return;

    try {
      if (format === 'png') {
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: null,
          scale: 3,
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${storeName.replace(/\s+/g, '-')}-qr-code.png`;
        link.href = url;
        link.click();
      } else {
        // SVG download
        const svg = qrRef.current.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.download = `${storeName.replace(/\s+/g, '-')}-qr-code.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
      toast({
        title: "QR Code Downloaded!",
        description: `Your QR code has been saved as ${format.toUpperCase()}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download QR code.",
        variant: "destructive",
      });
    }
  };

  const getTemplateStyles = (template: TemplateType) => {
    const baseStyles = "rounded-lg shadow-lg";
    switch (template) {
      case 'minimal':
        return {
          container: `${baseStyles} bg-white p-8`,
          titleClass: "text-2xl font-bold text-gray-900 mb-2",
          descClass: "text-sm text-gray-600 mb-4",
          gradient: null,
        };
      case 'elegant':
        return {
          container: `${baseStyles} bg-gradient-to-br from-purple-50 to-pink-50 p-10 border-2 border-purple-200`,
          titleClass: "text-2xl font-bold text-purple-900 mb-2",
          descClass: "text-sm text-purple-700 mb-4",
          gradient: 'bg-gradient-to-br from-purple-100 to-pink-100',
        };
      case 'modern':
        return {
          container: `${baseStyles} bg-gradient-to-br from-blue-50 to-cyan-50 p-10`,
          titleClass: "text-2xl font-bold text-blue-900 mb-2",
          descClass: "text-sm text-blue-700 mb-4",
          gradient: 'bg-gradient-to-br from-blue-100 to-cyan-100',
        };
      case 'classic':
        return {
          container: `${baseStyles} bg-amber-50 p-10 border-4 border-amber-900`,
          titleClass: "text-2xl font-bold text-amber-900 mb-2",
          descClass: "text-sm text-amber-800 mb-4",
          gradient: 'bg-amber-100',
        };
      default:
        return {
          container: `${baseStyles} bg-white p-8`,
          titleClass: "text-2xl font-bold text-gray-900 mb-2",
          descClass: "text-sm text-gray-600 mb-4",
          gradient: null,
        };
    }
  };

  const templateStyles = getTemplateStyles(selectedTemplate);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Share Store QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Store QR Code & Sharing</DialogTitle>
          <DialogDescription>
            Create a customizable QR code for your physical store. Perfect for printing cards, flyers, or displaying at your location.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="share">Share & Download</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex justify-center py-8 bg-gray-50 rounded-lg">
              <div ref={qrRef} className={templateStyles.container}>
                <div className="text-center">
                  {storeLogo && (
                    <img
                      src={storeLogo}
                      alt={storeName}
                      className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
                    />
                  )}
                  <h3 className={templateStyles.titleClass}>{storeName}</h3>
                  {storeDescription && (
                    <p className={templateStyles.descClass}>{storeDescription}</p>
                  )}
                  <div className="flex justify-center my-6">
                    <div className="p-4 bg-white rounded-xl shadow-md">
                      <QRCodeSVG
                        value={storeUrl}
                        size={200}
                        level="H"
                        fgColor={qrColor}
                        bgColor={bgColor}
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Scan to visit store</p>
                  <p className="text-xs text-gray-500 mt-1 break-all max-w-[250px] mx-auto">
                    {storeUrl.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              💡 Tip: Print this at 300 DPI for best quality. Recommended size: 4x6 inches or A6.
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Template Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['minimal', 'elegant', 'modern', 'classic'] as TemplateType[]).map((template) => (
                    <button
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTemplate === template
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{template}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template === 'minimal' && 'Clean & Simple'}
                        {template === 'elegant' && 'Purple Gradient'}
                        {template === 'modern' && 'Blue Gradient'}
                        {template === 'classic' && 'Vintage Look'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-color">QR Code Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr-color"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Printing Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-quality paper (200gsm or higher)</li>
                  <li>• Print at 300 DPI resolution</li>
                  <li>• Test scan before bulk printing</li>
                  <li>• Keep QR code at least 2x2 inches</li>
                  <li>• Avoid glossy finish for better scanning</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Share Store Link</CardTitle>
                <CardDescription>Copy or share your store URL directly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={storeUrl} readOnly className="flex-1" />
                  <Button onClick={copyToClipboard} variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button onClick={shareStore} variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Download QR Code</CardTitle>
                <CardDescription>Save your customized QR code for printing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => downloadQRCode('png')} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button onClick={() => downloadQRCode('svg')} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download SVG
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  PNG: Best for printing and social media<br />
                  SVG: Vector format, scales without quality loss
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Usage Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>🏪 Display at your physical store entrance</li>
                  <li>📄 Print on business cards and flyers</li>
                  <li>🎫 Add to receipts and packaging</li>
                  <li>📱 Share on social media stories</li>
                  <li>🪧 Create table tents for restaurants</li>
                  <li>📮 Include in email signatures</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
