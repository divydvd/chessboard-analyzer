
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AIProvider, getApiConfig, saveApiConfig } from '@/utils/chessAnalyzer';
import { Eye, EyeOff } from 'lucide-react';

export function APISettings() {
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved config
    const loadConfig = async () => {
      const config = await getApiConfig();
      if (config) {
        setProvider(config.provider);
        setApiKey(config.apiKey);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const success = await saveApiConfig({
        provider,
        apiKey
      });
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your API configuration has been saved"
        });
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save your API configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>
          Configure your API provider for chess position analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <RadioGroup
            value={provider}
            onValueChange={(value) => setProvider(value as AIProvider)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deepseek" id="deepseek" />
              <Label htmlFor="deepseek" className="cursor-pointer">DeepSeek Vision API</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="cursor-pointer">OpenAI GPT-4 Vision</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {provider === 'deepseek' ? (
              <>Get your API key from <a href="https://www.deepseek.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek</a></>
            ) : (
              <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI</a></>
            )}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
