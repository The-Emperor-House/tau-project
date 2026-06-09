'use client';

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

export default function EmotionRegistry({ options, children }) {
  const [{ cache, flush }] = React.useState(() => {
    // ใช้ key เดียวทั้งระบบ (ลดความซ้ำซ้อน)
    const cache = createCache({ key: 'mui', ...options });
    // ช่วยให้ className จาก SSR/CSR ทำงานร่วมกันได้
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted = [];

    // ดักชื่อสไตล์ที่ถูกแทรกระหว่าง SSR
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    // คืน <style> ทั้งหมดที่ถูกแทรกไว้ เพื่อไปฉีดเข้า HTML ตอน SSR
    const flush = () => {
      const styles = inserted.map((name) => (
        <style
          key={name}
          data-emotion={`${cache.key} ${name}`}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: cache.inserted[name] }}
        />
      ));
      inserted = [];
      return <>{styles}</>;
    };

    return { cache, flush };
  });

  // ฉีด <style> เข้าไปใน HTML ที่ SSR สร้าง ก่อน React ส่งถึง client
  useServerInsertedHTML(() => flush());

  // ให้ทั้งแอปใช้ cache ตัวเดียวกันนี้ (อย่าซ้อน CacheProvider อื่นอีก)
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}