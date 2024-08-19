'use server'
import React from 'react'
import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from 'mysql2/promise';

const route = () => {
  return (
    <div>route</div>
  )
}

export default route