import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { AIProvider } from '@/utils/chessAnalyzer';

// Mock function to get API config
// In a real app, this would be replaced with actual implementation
const getApiConfig = async (): Promise<{ provider: AIProvider; apiKey: string }> => {
  return {
    provider: 'deepseek',
    apiKey: ''
  };
};

const saveApiConfig = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
  return true;
};

const validateApiKey = async (provider: AIProvider, apiKey: string): Promise<{ valid: boolean; message: string }> => {
  return {
    valid: true,
    message: 'API Key is valid'
  };
};

interface APISettingsProps {
  onSettingsChange: (provider: AIProvider, apiKey: string) => void;
}

export function APISettings({ onSettingsChange }: APISettingsProps) {
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getApiConfig();
      setProvider(config.provider);
      setApiKey(config.apiKey);
    };

    loadConfig();
  }, []);

  const handleProviderChange = (value: AIProvider) => {
    setProvider(value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setIsValid(null);

    // Mock API key validation
    const validationResult = await validateApiKey(provider, apiKey);
    setIsValid(validationResult.valid);
    setValidationMessage(validationResult.message);

    if (validationResult.valid) {
      // Mock saving API config
      const saveSuccess = await saveApiConfig(provider, apiKey);

      if (saveSuccess) {
        onSettingsChange(provider, apiKey);
        console.log('API settings saved successfully');
      } else {
        setIsValid(false);
        setValidationMessage('Failed to save API settings');
        console.error('Failed to save API settings');
      }
    }

    setIsLoading(false);
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">API Settings</h2>

      <div className="mb-4">
        <Label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          AI Provider
        </Label>
        <RadioGroup defaultValue={provider} className="mt-2" onValueChange={handleProviderChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deepseek" id="r1" />
            <Label htmlFor="r1">DeepSeek</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="r2" />
            <Label htmlFor="r2">OpenAI</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="mb-4">
        <Label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
          API Key
        </Label>
        <Input
          type="password"
          id="api-key"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="mt-1"
        />
      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>

      {isValid !== null && (
        <div className={`mt-4 p-3 rounded-md ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            )}
            <p className={`text-sm font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              {validationMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
