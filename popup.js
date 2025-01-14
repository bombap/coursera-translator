
document.addEventListener('DOMContentLoaded', async () => {
  const translateBtn = document.getElementById('translateBtn');

  translateBtn.addEventListener('click', async () => {
    try {
      const lang = document.getElementById('lang').value;

      // Lưu ngôn ngữ đã chọn
      await chrome.storage.sync.set({ lang });
      console.log('Language set to:', lang);

      // Lấy tab hiện tại
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Đảm bảo content script đã được inject
      try {
        // Thử gửi message trước
        const response = await chrome.tabs.sendMessage(tab.id, {
          method: 'translate',
          lang: lang
        });

        if (response?.method === 'translate') {
          console.log('Translation request successful');
        }
      } catch (err) {
        // Nếu không có content script, inject nó
        if (err.message.includes('Receiving end does not exist')) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // Thử gửi message lại
          const response = await chrome.tabs.sendMessage(tab.id, {
            method: 'translate',
            lang: lang
          });
          if (response?.method === 'translate') {
            console.log('Translation request successful after injection');
          }
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Error during translation:', error);
    }
  });
});