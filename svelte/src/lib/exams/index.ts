import type { Exam } from '../types';
import { proeftoets } from './proeftoets';
import { oefentoetsDC } from './oefentoets';
import { weekG } from './weekG';
import { bookWeekE, bookWeekF } from './book';

export const EXAMS: Exam[] = [proeftoets, oefentoetsDC, weekG, bookWeekE, bookWeekF];
