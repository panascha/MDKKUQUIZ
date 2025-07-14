import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./Dialog";

interface RegistrationQuestionsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  answers: {
    q1: string;
    q2: string;
    q3: string;
  };
  setAnswers: React.Dispatch<React.SetStateAction<{
    q1: string;
    q2: string;
    q3: string;
  }>>;
  onSubmit: () => void;
}

const RegistrationQuestionsModal: React.FC<RegistrationQuestionsModalProps> = ({ open, setOpen, answers, setAnswers, onSubmit }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>โปรดตอบคำถามต่อไปนี้</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block mb-2 font-medium">1) รูปใดต่อไปนี้ที่สามารถนำมาใช้สร้างโจทย์ในเว็บ mseb ได้</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input type="radio" name="q1" value="a" checked={answers.q1 === 'a'} onChange={() => setAnswers(a => ({ ...a, q1: 'a' }))} required />
                a. รูปที่ถ่ายเองจากแลป
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q1" value="b" checked={answers.q1 === 'b'} onChange={() => setAnswers(a => ({ ...a, q1: 'b' }))} />
                b. รูปที่ถ่ายเองจากแลป แต่ติดหน้าอาจารย์ใหญ่
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q1" value="c" checked={answers.q1 === 'c'} onChange={() => setAnswers(a => ({ ...a, q1: 'c' }))} />
                c. รูปที่แคปจากเว็บไซต์ต่าง ๆ
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q1" value="d" checked={answers.q1 === 'd'} onChange={() => setAnswers(a => ({ ...a, q1: 'd' }))} />
                d. รูปที่แคปจากสไลด์เรียน
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">2) สามารถแคปรูปภาพในเว็บไซต์ mseb ไปใช้นอกเว็บไซต์ได้หรือไม่</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input type="radio" name="q2" value="a" checked={answers.q2 === 'a'} onChange={() => setAnswers(a => ({ ...a, q2: 'a' }))} required />
                a. ได้
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q2" value="b" checked={answers.q2 === 'b'} onChange={() => setAnswers(a => ({ ...a, q2: 'b' }))} />
                b. ไม่ได้
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">3) โจทย์ปัญหาในข้อใดที่สามารถรีพอร์ตข้อผิดพลาดของโจทย์มาที่แอดมินได้</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input type="radio" name="q3" value="a" checked={answers.q3 === 'a'} onChange={() => setAnswers(a => ({ ...a, q3: 'a' }))} required />
                a. โจทย์ที่เฉลยผิด
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q3" value="b" checked={answers.q3 === 'b'} onChange={() => setAnswers(a => ({ ...a, q3: 'b' }))} />
                b. โจทย์ที่สะกดคำผิด
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q3" value="c" checked={answers.q3 === 'c'} onChange={() => setAnswers(a => ({ ...a, q3: 'c' }))} />
                c. โจทย์ที่สามารถตอบได้มากกว่า 1 คำตอบ
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="q3" value="d" checked={answers.q3 === 'd'} onChange={() => setAnswers(a => ({ ...a, q3: 'd' }))} />
                d. ถูกทุกข้อ สงสัยว่าข้อไหนมีปัญหาก็สามารถรีพอร์ตได้เลย
              </label>
            </div>
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationQuestionsModal; 