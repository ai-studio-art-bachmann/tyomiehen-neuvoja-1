export class WebhookService {
  private abortController: AbortController | null = null;

  async sendAudioToWebhook(audioBlob: Blob, webhookUrl: string): Promise<string> {
    // Cancel any previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    const controller = new AbortController();
    this.abortController = controller;

    try {
      console.log('Sending audio to webhook:', webhookUrl);
      console.log('Audio blob size:', audioBlob.size, 'bytes');

      const formData = new FormData();
      formData.append('data0', audioBlob, 'speech.webm');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        signal: this.abortController.signal,
        headers: {
          'Accept': 'audio/mpeg,application/json,*/*'
        }
      });

      console.log('Webhook response status:', response.status);
      console.log('Webhook response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Palvelin vastasi virheellä: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received JSON response from n8n:', data);
      
      // Handle the n8n response structure that might include file data
      if (data.success !== undefined || data.textResponse !== undefined || data.audioResponse !== undefined || data.fileUrl !== undefined || data.fileResponse !== undefined) {
        let textData = { answer: 'Vastausta ei saatu.' };
        if (data.textResponse) {
          try {
            textData = JSON.parse(data.textResponse);
          } catch (e) {
            console.warn('Could not parse textResponse as JSON, using as string');
            textData = { answer: data.textResponse };
          }
        } else if (data.answer) { // Fallback if textResponse is not present but answer is
            textData = { answer: data.answer };
        }

        let audioUrl: string | undefined = undefined;
        if (data.audioResponse && typeof data.audioResponse === 'string') {
          try {
            const base64Data = data.audioResponse.replace(/^data:audio\/[^;]+;base64,/, '');
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const audioBlobContent = new Blob([bytes], { type: 'audio/mpeg' });
            audioUrl = URL.createObjectURL(audioBlobContent);
            console.log('Created audio URL from base64:', audioUrl);
          } catch (error) {
            console.error('Error converting base64 audio:', error);
          }
        } else if (data.audioUrl) { // Fallback for direct audioUrl
            audioUrl = data.audioUrl;
        }
        
        const fileUrl = data.fileUrl || (data.fileResponse ? data.fileResponse.url : undefined);
        const fileType = data.fileType || (data.fileResponse ? data.fileResponse.type : undefined);

        return JSON.stringify({
          text: textData.answer || 'Vastausta ei saatu.',
          audioUrl: audioUrl,
          fileUrl: fileUrl,
          fileType: fileType
        });
      } else {
        // Fallback for simpler/direct response format (already JSON object)
        return JSON.stringify({
            text: data.answer || 'Vastausta ei saatu.',
            audioUrl: data.audioUrl,
            fileUrl: data.fileUrl,
            fileType: data.fileType
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Pyyntö keskeytetty');
      }
      console.error('Webhook error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Verkkoyhteydessä on ongelma. Tarkista internetyhteys.');
      }
      
      throw new Error('Palvelinyhteys epäonnistui');
    }
  }

  cleanup() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
