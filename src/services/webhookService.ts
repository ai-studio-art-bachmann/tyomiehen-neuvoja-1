
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
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'audio/mpeg,application/json,*/*'
        }
      });

      console.log('Webhook response status:', response.status);
      console.log('Webhook response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Palvelin vastasi virheellä: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (contentType && contentType.includes('audio')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Received audio response, created URL:', audioUrl);
        return audioUrl;
      } else {
        const data = await response.json();
        console.log('Received JSON response:', data);
        return data.answer || data.response || 'Vastausta ei saatu.';
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
