import { Button } from '@/components/ui/button';
import React from 'react';

export default function HelloBulk() {
  return (
    <div>
      <div>HelloBulk</div>
      <a href="/bulk/bulk-update">
        <Button >Bulk Update</Button>
      </a>
      <br />
      <br />
      <br />
      <br />
      <a href="/bulk/bulk-create">
        <Button>Bulk Create</Button>
      </a>
    </div>
  );
}
