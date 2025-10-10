import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("data/kip.json");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, points, action } = body;

  const rawData = fs.readFileSync(filePath, "utf-8");
  const kipData = JSON.parse(rawData);

  if (!kipData[userId]) kipData[userId] = { kip: 0 };

  if (action === "gain") {
    kipData[userId].kip += points;
  } else if (action === "perdu") {
    kipData[userId].kip = Math.max(0, kipData[userId].kip - points);
  }

  fs.writeFileSync(filePath, JSON.stringify(kipData, null, 2));

  return NextResponse.json({ success: true });
}

