"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";

const feedbackData = [
  { name: "Technical", score: 75 },
  { name: "Communication", score: 65 },
  { name: "Problem Solving", score: 80 },
  { name: "Cultural Fit", score: 70 },
];

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-12 flex flex-col items-center">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-extrabold mb-10 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
      >
        Interview Feedback
      </motion.h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Scores */}
        <Card className="bg-gray-900/60 border border-gray-700 rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-300">
              Performance Overview
            </h2>

            {feedbackData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{item.name}</span>
                  <span>{item.score}%</span>
                </div>
                <Progress value={item.score} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="bg-gray-900/60 border border-gray-700 rounded-2xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">
              Score Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feedbackData}>
                <XAxis
                  dataKey="name"
                  stroke="#aaa"
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="bg-gray-900/60 border border-gray-700 rounded-2xl shadow-xl md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-green-400 mb-3">
              Strengths
            </h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Strong problem-solving ability</li>
              <li>Good understanding of core concepts</li>
              <li>Confident when explaining solutions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="bg-gray-900/60 border border-gray-700 rounded-2xl shadow-xl md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-3">
              Areas for Improvement
            </h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Improve communication clarity under pressure</li>
              <li>Explain thought process more structured</li>
              <li>Practice behavioral questions for cultural fit</li>
            </ul>
          </CardContent>
        </Card>

        {/* Final Verdict */}
        <Card className="bg-gray-900/60 border border-gray-700 rounded-2xl shadow-xl md:col-span-2">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Final Evaluation
            </h2>
            <p className="text-xl font-bold text-green-400">Potential Hire</p>
            <p className="text-gray-400 text-sm mt-2">
              Candidate shows strong potential but should refine communication
              skills.
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Back link */}
      <Link href="/">
        <p className="mt-10 opacity-50 hover:opacity-100 hover:font-semibold transition cursor-pointer">
          <FaAngleLeft className="inline mr-1" /> Back to the Homepage
        </p>
      </Link>
    </div>
  );
}
