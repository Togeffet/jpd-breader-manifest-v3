console.log('Yo boutta set it dawg');
await chrome.storage.local.set({ test: 'YOOOO IT WORKED' });

const itWorked = await chrome.storage.local.get('test');

console.log('HERE IT IS? ', itWorked);

console.log(itWorked['test']);
